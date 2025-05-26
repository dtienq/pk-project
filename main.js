const { getUic, parseDateToISO, callApiTiepDon, getStaffs } = require('./functions.js');
const fs = require('fs');
const converter = require('json-2-csv');

var fileContent = fs.readFileSync('victims.csv', 'utf8');
fileContent = fileContent.replaceAll('\r', '');
const victims = converter.csv2json(fileContent);

getStaffs().then(x => {
    createObjs(x);
});

function toTitleCase(str) {
    return str
        .toLowerCase() // Convert entire string to lowercase
        .split(' ')     // Split into words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter
        .join(' ');     // Join words back
}

function createObjs(staffs) {
    var seconds = 1;

    victims.forEach(victim => {
        setTimeout(() => {
            var uic = getUic(victim.fullName, victim.yearOfBirth);
            var staff = staffs.filter(x => x.Manv == victim.staffCode)[0];

            var data = {
                "TT_Hanhchinh": {
                    "Hoten": toTitleCase(victim.fullName),
                    "Gioitinh": victim.sex == 'Nam' ? 1 : 2,
                    "Namsinh": victim.yearOfBirth,
                    "Ngaysinh": `${victim.yearOfBirth - 1}-12-31T17:00:00.000Z`,
                    "UIC": uic,
                    "Diachi": {
                        "Sonha": ""
                    },
                    "Hokhau": {
                        "Sonha": ""
                    },
                    "checkDC": false
                },
                "Tiensu_XNDT": {
                    "Tiensu_XN": 1,
                    "Ngay_XN_HIV": "",
                    "Trangthai_PrEP": "",
                    "Trangthai_ARV": "",
                    "Chuyengui_ARV": "",
                    "XN_Lai": "",
                    "tx_ma_xnkd": ""
                },
                "TT_Tiepdon": {
                    "Ngay_td": parseDateToISO(victim.testDate),
                    "Ma_nv_td": "202210310846052431",
                    "Ma_cs": 524,
                    "Serial_cs": "HCM-29",
                    "Loai_cs": 1,
                    "Loai_cs_disabled": false,
                    "Ma_nv_cd": staff.id,
                    "Da_xn": false,
                    "Ma_da": "",
                    "Stt": String(victim.last4digits).padStart(4, '0'),
                    "Ma_congdong": "",
                    "Ma_XNSL": `KC-HCM-29-${victim.staffCode}-0${String(victim.last4digits).padStart(4, '0')}`,
                    "Noi_gt": [
                        1
                    ],
                    "Da_tc": false,
                    "Nguon_kinh_phi": 7,
                    "isBosung": false
                },
                "DS_nguyco": [
                    13
                ],
                "Nguyco_khac": "",
                "DS_Hanhvi": [
                    3
                ],
                "Hanhvi_Khac": "",
                "Nguyco_chinh": 13,
                "Tuvan_btbc": {},
                "Xac_minh": {},
                "TV_SXN": {},
                "KQ_Xetnghiem": 0,
                "duan_sc": 2,
                "isHanhvi_Khac": false,
                "isNguyco_khac": false,
                "unlocked": ""
            };

            callApiTiepDon(data, victim);
        }, (seconds++) * 1000);
    });
}





