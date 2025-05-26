var key = '2uw6OYU9GwjyhxrTCoptdHvIANW58O9GrkqQ1HPzdCXUJKdFQlz4hCHhQl8QqXfyTDZcVDHjEJYucgA5rygKNzc9tSFTrqQ7S9veKnSW0m37OmKOmROe9EmCFlASmSXiuZT2OD1GUCCSc/qm8bIvvqNQ3Ww9aXYMpwIhvr7nnpbx9Hvtw12QKP6TGLQlQfDneLKw5H4AMXApbocHk7TvBN6Y45xeyesQQVRCovsac2skUxvIzKHOMw==';
var tokenXNLS = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjExNTEiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiNzk3NzFzZ25fYmFjc2kiLCJBc3BOZXQuSWRlbnRpdHkuU2VjdXJpdHlTdGFtcCI6IldBSjVBUVpKRkVBUE82SE1KVVlDQzRHS1hUS0ZHTFBaIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjpbIkJhY1NpIiwiWGV0TmdoaWVtQ2FuTGFtU2FuZyIsIlRpZXBEb24iLCJUdVZhbl9DYXBQaGF0VGh1b2MiLCJUdVZhbl9EYW5oR2lhWGV0TmdoaWVtIl0sImh0dHA6Ly93d3cuYXNwbmV0Ym9pbGVycGxhdGUuY29tL2lkZW50aXR5L2NsYWltcy90ZW5hbnRJZCI6IjIzNyIsIlNlc3Npb25fTWFEaW5oRGFuaCI6IiIsIlNlc3Npb25fRW1haWxBZGRyZXNzIjoidGhhbmhodXUxOTA1MDFAZ21haWwuY29tIiwiU2Vzc2lvbl9Kc29uTGV2ZWwiOiJbMzAsMTAsMjUsMjAsMzVdIiwic3ViIjoiMTE1MSIsImp0aSI6ImZmZTMxNGY5LTFhYTYtNGMxYy05YmM5LWE4ODVkZTg4NjY3YyIsImlhdCI6MTc0ODA3NjM5MiwidG9rZW5fdmFsaWRpdHlfa2V5IjoiZTljOTk1YmMtZTE0My00OWI4LWE4OTYtNjJiMzBhMjRhM2U5IiwidXNlcl9pZGVudGlmaWVyIjoiMTE1MUAyMzciLCJ0b2tlbl90eXBlIjoiMCIsIm5iZiI6MTc0ODA3NjM5MiwiZXhwIjoxNzQ4MTYyNzkyLCJpc3MiOiJQTVMiLCJhdWQiOiJQTVMifQ.dDP7WqzN51lwcH1Nd0cfoTlzTFPiJIBzkeVX2x_NtG8`;
const axios = require('axios');
const https = require('https');
const converter = require('json-2-csv');
const fs = require('fs');
var errList = [];
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

const optDef = {
    headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${key}`
    },
    httpsAgent
};

function getUic(fullName, yearOfBirth) {
    var nameParts = fullName.split(' ');
    var last2DigitYOB = `${yearOfBirth}`.substr(2, 2);

    if (nameParts.length == 1) return '';

    var firstName = nameParts[0];
    var lastName = nameParts[nameParts.length - 1];

    return removeVietnameseTones(`${firstName[0]}${firstName[2] || '9'}${lastName[0]}${lastName[2] || '9'}10101${last2DigitYOB}`);
}

function removeVietnameseTones(str) {
    return str
        .normalize("NFD")                      // Tách ký tự và dấu
        .replace(/[\u0300-\u036f]/g, "")       // Loại bỏ dấu
        .replace(/đ/g, "d").replace(/Đ/g, "D"); // Thay đ → d, Đ → D
}

function parseDateToISO(input) {
    const parts = input.split('/');
    if (parts.length !== 3) return null;

    let [day, month, year] = parts.map(Number);
    if (!day || !month || !year) return null;

    // Tạo Date với UTC+7
    const localDate = new Date(Date.UTC(year, month - 1, day));
    localDate.setUTCHours(localDate.getUTCHours() - 7); // Trừ 7 tiếng để đưa về UTC+0

    return localDate.toISOString(); // Trả về theo định dạng chuẩn ISO
}

function callApiTiepDon(data, victim) {
    const options = {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${key}`
        },
        httpsAgent
    };

    axios.post('https://xnhiv.vn/elog-api/Data/Add_Tiepdon', data, options)
        .then((res) => {
            var dto = res.data;

            if (dto.CodeName == 'ERROR') {
                victim.ErrMessage = dto.ErrMessage;
                errList.push(victim);
                console.log("Không tạo tiếp đón được", dto);

                var csvStr = converter.json2csv(errList);
                fs.writeFileSync(`./listError_${new Date().getTime()}.csv`, csvStr);
            } else if (dto.CodeName == 'SUCCESS') {
                CallApiSaveXetNghiemSL(dto.Data, data.TT_Tiepdon.Ngay_td);
            }
        }).catch((err) => {
            victim.ErrMessage = 'Lỗi Không Xác Định';
            errList.push(victim);
            console.log("Victim error", victim);
            fs.writeFileSync(`./listError_${new Date().getTime()}.csv`, csvStr);
        });
}

function getStaffs() {
    const options = {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${key}`
        },
        httpsAgent
    };

    return axios.get('https://xnhiv.vn/elog-api/Para/Get_NhanvienCD?iCSYT_Id=524', options)
        .then((res) => {
            return res.data.Data;
        }).catch((err) => {
            console.error(err);
        });
}

function CallApiSaveXetNghiemSL(tiepDonId, ngayTd) {
    const options = {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${key}`
        },
        httpsAgent
    };

    axios.get(`https://xnhiv.vn/elog-api/Data/Get_Tiepdon_Info?iTiepdon_id=${tiepDonId}`, options)
        .then(res => {
            var dTmp = res.data;
            var Khachhang_id = dTmp.Data.Khachhang_id;

            var data = {
                "Sangloc": {
                    "Tiepdon_id": tiepDonId,
                    "Khachhang_id": Khachhang_id,
                    "Hinhthuc_SP": "",
                    "Loaisp_id": "",
                    "Loaisp_khac": "",
                    "Ngaynhan_SP": null,
                    "KQ_Tuthuchien": null,
                    "Hinhthuc_xn": 2,
                    "KQ_Sangloc": 1,
                    "KQ_KN_KT": "",
                    "TT_XN_Khangdinh": {
                        "CSYT_Id": "",
                        "CSYT_Name": "",
                        "Tinh_id": 0
                    },
                    "TT_Chuyengui": {
                        "Sudung": 1,
                        "LoaihinhXN_Id": 3
                    },
                    "IsCopyCG": false
                },
                "Khangdinh": {
                    "Tiepdon_id": tiepDonId,
                    "Khachhang_id": Khachhang_id,
                    "Ma_cs": 524,
                    "Ma_khangdinh": dTmp.Data.TT_Tiepdon.Ma_XNSL,
                    "NSP_Sangloc": 7,
                    "TT_XN_Khangdinh": {}
                },
                "Type": 0
            };

            axios.post('https://xnhiv.vn/elog-api/Data/Save_XetNghiemSL', data, options)
                .then((res) => {
                    var dto = res.data;

                    if (dto.CodeName == 'SUCCESS') {
                        CallApiSave_TVSXN(tiepDonId, dTmp.Data.TT_Tiepdon.Ma_nv_cd, ngayTd);
                    }
                }).catch((err) => {
                    console.error(err);
                });
        })
}

function CallApiSave_TVSXN(tiepDonId, staffId, ngayTV) {
    const options = {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${key}`
        },
        httpsAgent
    };

    var data = {
        "Tiepdon_id": tiepDonId,
        "Ma_nv": staffId,
        "NgayTV": ngayTV
    };

    axios.post('https://xnhiv.vn/elog-api/Data/Save_TVSXN', data, options)
        .then((res) => {
            console.log("Created Successfully!");
        }).catch((err) => {
            console.error(err);
        });
}

function deleteHoSoTuVan(id) {
    axios.delete(`https://xnhiv.vn/elog-api/Data/Delete_Tiepdon/${id}`, optDef)
        .then((res) => {
            console.log(res)
            console.log("Deleted Successfully!");
        }).catch((err) => {
            console.error(err);
        });
}

function getTotalXetNghiemLamSang() {
    const url = 'https://prepapi.vaac.gov.vn/api/services/app/CrmGirdView/GetAllServerPaging';

    const postData = {
        formId: 70,
        formCase: 10,
        sorting: 'ngayBacSiKham DESC',
        maxResultCount: 10,
        skipCount: 0
    };

    return axios.post(url, postData, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenXNLS}`
        }
    })
        .then(response => {
            return response.data.result.totalCount;
            // console.log('✅ API Response Total Case:', JSON.stringify(response.data.result.totalCount, null, 2));
        })
        .catch(error => {
            console.log('❌ API Error:', error.response?.data || error.message);
        });
}

function getAllCases(totalCount, fullName, fromDate, toDate) {
    const url = 'https://prepapi.vaac.gov.vn/api/services/app/CrmGirdView/GetAllServerPaging';

    const postData = {
        formId: 70,
        formCase: 10,
        sorting: 'ngayBacSiKham DESC',
        maxResultCount: totalCount,
        skipCount: 0,
        filter: fullName || '',
        tuNgayBacSiKham: `${fromDate}T00:00:00+07:00`,
        denNgayBacSiKham: `${toDate}T23:59:59+07:00`
    };

    return axios.post(url, postData, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenXNLS}`
        }
    })
        .then(response => {
            return response.data.result.items;
            // console.log('✅ API Response Total Case:', JSON.stringify(response.data.result.totalCount, null, 2));
        })
        .catch(error => {
            console.log('❌ API Error:', error.response?.data || error.message);
        });
}

function ThongTinKhachHang(khachHangId) {
    return axios.get(`https://prepapi.vaac.gov.vn/api/services/app/CrmGirdView/GetKhachHangById`, {
        params: {
            _khachHangId: khachHangId
        },
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + tokenXNLS
        }
    })
        .then(response => {
            return response.data.result;
        })
        .catch(error => {
            console.error('Lỗi khi gọi API:', error.response ? error.response.data : error.message);
        });
}

function GetInitXetNghiemCanLamSang(khachHangId, quyTrinhXuLyId) {
    return axios.get(`
https://prepapi.vaac.gov.vn/api/services/app/XetNghiemCanLamSang/GetInitXetNghiemCanLamSang`, {
        params: {
            _khachHangId: khachHangId,
            _quyTrinhXuLyId: quyTrinhXuLyId,
            _isEdit: false
        },
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + tokenXNLS
        }
    })
        .then(response => {
            return response.data.result;
        })
        .catch(error => {
            console.error('Lỗi khi gọi API:', error.response ? error.response.data : error.message);
        });
}

function convertDateStrToUtc07(dateStr) {
    // Thiết lập timezone mặc định là UTC+7
    const tz = 'Asia/Bangkok';

    // Lấy thời gian hiện tại (giờ, phút, giây)
    const now = dayjs().tz(tz);

    // Phân tích ngày và kết hợp thời gian hiện tại
    return dayjs(dateStr, "DD/MM/YYYY").set('hour', now.hour())
        .set('minute', now.minute())
        .set('second', now.second())
        .tz(tz)
        .format();  // ISO 8601
}

async function Save_XetNghiemCanLamSang(Save_XetNghiemCanLamSangReq) {
    return axios.post('https://prepapi.vaac.gov.vn/api/services/app/XetNghiemCanLamSang/Save_XetNghiemCanLamSang', Save_XetNghiemCanLamSangReq, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + tokenXNLS // Bỏ comment nếu cần xác thực
        }
    })
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error('Lỗi:', error.response ? error.response.data : error.message);
            return error.response.data;
        });
}

module.exports = {
    Save_XetNghiemCanLamSang,
    convertDateStrToUtc07,
    GetInitXetNghiemCanLamSang,
    ThongTinKhachHang,
    parseDateToISO,
    getUic, callApiTiepDon, getStaffs, deleteHoSoTuVan, getTotalXetNghiemLamSang, getAllCases
}