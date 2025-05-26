const { layThongTinCretinin, fetchPatientData } = require("./crawl_html");
const { getTotalXetNghiemLamSang, getAllCases, ThongTinKhachHang, GetInitXetNghiemCanLamSang, convertDateStrToUtc07, Save_XetNghiemCanLamSang } = require("./functions");
const { writeLog } = require("./slog");
const fs = require('fs');

const args = process.argv.slice(2);

// lấy thông tin từ kqxn.html
if (args[0] == 'REQ001') {
  layThongTinCretinin();
}

// lấy thông tin của một SID
if (args[0] == 'REQ002') {
  var arrError = JSON.parse(fs.readFileSync('./cretitine_info_err_list.json'));

  arrError.forEach(sid => {
    var arr = JSON.parse(fs.readFileSync('./cretitine_info.json'));

    fetchPatientData(sid).then(result => {
      arr.push(result);
      fs.writeFileSync('./cretitine_info.json', JSON.stringify(arr));
    });
  })

}

// nhập thông tin vào https://prep.vaac.gov.vn
if (args[0] == 'REQ003') {
  var month = args[1];
  var year = args[2];

  if (!month || !year) {
    console.log("Thieu variable!");
    return;
  }

  var date = new Date();
  date.setMonth(month);
  date.setDate(0);
  var fromDate = `${year}-${month}-01`;
  var toDate = `${year}-${month}-${date.getDate()}`;
  console.log(`${fromDate}-${toDate}`);

  var cretitineArr = JSON.parse(fs.readFileSync('./cretitine_info.json'));
  var counttt = 0;
  // cretitineArr = [cretitineArr[0]];
  var afterRunCretitineArr = [...cretitineArr];

  cretitineArr.forEach(dsp => {
    if (dsp && dsp.creatinin && dsp.creatinin != '') {
      setTimeout(() => {
        fullName = dsp.fullName;
        getTotalXetNghiemLamSang().then(totalCount => {
          getAllCases(totalCount, fullName, fromDate, toDate).then(items => {
            if(items == null || items == undefined) {
              return;
            }
            
            items = items.filter(x => x.ngaySinh.substr(0, 4) == dsp.age);

            if (items.length == 1) {
              var kh = items[0];

              GetInitXetNghiemCanLamSang(kh.khachHangId, kh.quyTrinhXuLyId).then(resInitXetNghiemCanLamSang => {
                for (var index in resInitXetNghiemCanLamSang.listXetNghiemDto) {
                  var xetNghiemDto = resInitXetNghiemCanLamSang.listXetNghiemDto[index];
                  xetNghiemDto.nguoiTraXetNghiemId = 0
                  if (xetNghiemDto.strLoaiXetNghiem == "XN Creatinine") {
                    xetNghiemDto.jsonKetQuaXetNghiem = dsp.creatinin;
                    xetNghiemDto.ngayTraXetNghiem = convertDateStrToUtc07(dsp.cretitineDate);
                  } else {
                    xetNghiemDto.ngayTraXetNghiem += "+07:00";
                  }
                }
                var Save_XetNghiemCanLamSangReq = { listXetNghiemDto: resInitXetNghiemCanLamSang.listXetNghiemDto };
                Save_XetNghiemCanLamSangReq.quyTrinhXuLyId = kh.quyTrinhXuLyId;

                Save_XetNghiemCanLamSang(Save_XetNghiemCanLamSangReq).then(Save_XNLSRes => {
                  if (Save_XNLSRes.success === true) {
                    console.log("SUCCESS");
                    afterRunCretitineArr = afterRunCretitineArr.filter(num => num.fullName != dsp.fullName && num.age != dsp.age);
                  }
                });
              })
            } else if (items.length > 1) {
              writeLog("Khách hàng bị trùng tên " + JSON.stringify(items));
            } else if(items.length == 0) {
              writeLog("Khách hàng này đã điền thông tin rồi! " + JSON.stringify(dsp));
              afterRunCretitineArr = afterRunCretitineArr.filter(num => num != dsp);
            }
            fs.writeFileSync('./cretitine_info.json', JSON.stringify(afterRunCretitineArr));
          });
        });
      }, 200 * (counttt++))
    } else {
      writeLog(`Khách hàng có thông tin không hợp lệ ${JSON.stringify(dsp)}`)
    }
  })
}





