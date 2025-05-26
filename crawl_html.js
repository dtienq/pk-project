const fs = require('fs');
const cheerio = require('cheerio');
const axios = require('axios');
const { writeLog } = require('./slog');
const path = require('path');

// Đọc nội dung file HTML
const html = fs.readFileSync('./kqxn.html', 'utf8');

// Load HTML bằng cheerio
const $ = cheerio.load(html);

// Tìm bảng theo id
const table = $('#ctl00_Contentplaceholder2_dgvThuTien');
if (!table.length) {
  console.error('Không tìm thấy bảng với ID ctl00_Contentplaceholder2_dgvThuTien');
  process.exit(1);
}

// Tìm index của cột "Mã SID"
let sidColumnIndex = -1;
table.find('tbody tr th').each((i, th) => {
  const headerText = $(th).text().trim();
  if (headerText === 'Mã SID') {
    sidColumnIndex = i;
  }
});

if (sidColumnIndex === -1) {
  console.error('Không tìm thấy cột "Mã SID" trong bảng.');
  process.exit(1);
}

// Lấy dữ liệu từ cột "Mã SID"
const sidList = [];
table.find('tbody tr').each((i, row) => {
  const cells = $(row).find('td');
  const sidValue = $(cells[sidColumnIndex]).text().trim();
  if (sidValue) {
    sidList.push({ sidCode: sidValue });
  }
});

async function fetchPatientData(sidCode) {
  try {
    // Tải nội dung trang web
    const { data } = await axios.get(`https://www.ilabmedical.com/PrintResult.aspx?SID=${sidCode}&in=&cate=&vn=0`);
    const $ = cheerio.load(data);

    const fullName = $('#lbltenbn').text().trim();
    const age = $('#lbltuoi').text().trim();
    const cretitineDate = $('#lb_ngaydk').text().trim();
    let creatinin = '';
    $('table tr').each((i, row) => {
      const firstCol = $(row).find('td').first().text().trim().toLowerCase();
      if (firstCol.includes('creatinin')) {
        creatinin = $(row).find('td').eq(1).text().trim().match(/\d+/)?.[0] || '';
      }
    });

    // Trả về kết quả dưới dạng JSON
    return {
      fullName,
      age,
      creatinin,
      cretitineDate
    };
  } catch (error) {
    // writeLog(`Không crawl được data của ${sidCode}`);
    console.log(error)
  }
}

// Gọi hàm và in kết quả
var cretitineFile = 'cretitine_info.json';
function layThongTinCretinin() {
  var times = 1;
  var arr = [];
  sidList.forEach(obj => {
    setTimeout(() => {
      fetchPatientData(obj.sidCode).then(result => {
        if (result == null) {
          writeLog(`Không crawl được data của ${obj.sidCode}`);
          const logFile = path.join(__dirname, 'cretitine_info_err_list.json');
          fs.appendFile(logFile, obj.sidCode, (err) => {
              if (err) {
                console.error('Failed to write log:', err);
              }
          });
        } else {
          arr.push(result);
          fs.writeFileSync(cretitineFile, JSON.stringify(arr));
        }
      });
    }, (times++) * 500);
  });
}

module.exports = { layThongTinCretinin, fetchPatientData }