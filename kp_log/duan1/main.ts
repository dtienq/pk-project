import axios from "axios";
import { CustomerDto } from "./CustomerDto";
// import fs from 'fs';
import * as fs from 'fs';
import * as https from 'https';
import { ThongTinKhachHangDto } from "./ThongTinKhachHangDto";
import { AddTiepDonRequestDto, TT_Hanhchinh } from "./AddTiepDonRequestDto";
import { SaveXetNghiemKDRequestDto } from "./SaveXetNghiemKDRequestDto";
import { SaveDieuTriRequestDto } from "./SaveDieuTriRequestDto";
import { writeLog } from "./slog";
import { GetTiepdonRequestDto, GetTiepdonResponseDataDto, GetTiepdonResponseDto } from "./Get_TiepDon";
const converter = require('json-2-csv');

var bearerToken = process.argv.slice(2)[0];

const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

// step 1: Lấy họ tên, Năm sinh, Giới tính từ file CSV => danhSachKhachHang
writeLog("Start running job nhap_csyt_kp_elog...");

runJob();

function runJob() {
    var fileContent = fs.readFileSync('./input_data.csv', 'utf8');
    fileContent = fileContent.replace(/\r\n/g, '\n');
    fileContent = fileContent.replace(/\r/g, '');
    var danhSachKhachHang: CustomerDto[] = converter.csv2json(fileContent);

    var count = 0;
    danhSachKhachHang.forEach((kh: CustomerDto) => {
        setTimeout(() => {
            layDanhSachNhanVien().then(nhanVienList => {
                AddTiepDon(kh, nhanVienList).then(res => {
                    var tiepDonId = res?.tiepDonId || 0;
                    if (tiepDonId) {
                        CallApiSaveXetNghiemSL(tiepDonId, kh).then((res1) => {
                            if (res1?.data.CodeName == 'SUCCESS') {
                                saveDieuTri(tiepDonId, res1?.khachHangId, kh, res?.staffId).then(res2 => {
                                    if (res2.CodeName == 'SUCCESS') {
                                        XacMinh(tiepDonId, kh);
                                    }
                                })
                            }

                        });
                    }
                });
            });
        }, (count++) * 1000);
    });
}

async function layDanhSachNhanVien() {
    console.log("Bắt đầu lấy danh sách nhân viên...", bearerToken);
    return axios.get('https://xnhiv.vn/elog-api/Para/Get_Nhanvien', {
        params: { iCSYT_Id: 524 },
        headers: {
            'Authorization': bearerToken,
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        httpsAgent: httpsAgent
    }).then(res => {
        if (res.data.CodeName === 'SUCCESS') {
            return res.data.Data;
        }
        return [];
    });
}

// call API 
// step 3: Call API POST https://xnhiv.vn/elog-api/Data/Add_Tiepdon
// example request body: {"TT_Hanhchinh":{"Hoten":"Trần Trọng Trạng","Gioitinh":1,"Namsinh":1997,"Ngaysinh":"1997-01-01T00:00:00+07:00","Solienhe":"0938185915","CCCD":"096097009507","loai_giay_to":1,"Nghenghiep_id":0,"Dantoc_id":0,"UIC":"TATA1010197","Diachi":{"Sonha":"","Xaphuong_id":0,"Tinh_id":0,"Quanhuyen_id":0,"Diachi":"","Ten_Xaphuong":null},"Hokhau":{"Sonha":"","Xaphuong_id":0,"Tinh_id":0,"Quanhuyen_id":0,"Diachi":"","Ten_Xaphuong":null},"checkDC":false},"Tiensu_XNDT":{"Tiensu_XN":2,"Ngay_XN_HIV":"2025-02-16T17:00:00.000Z","Trangthai_PrEP":2,"Trangthai_ARV":0,"Chuyengui_ARV":0,"XN_Lai":0,"tx_ma_xnkd":""},"TT_Tiepdon":{"Ngay_td":"2025-04-14T17:00:00.000Z","Ma_nv_td":"8d0cc781-242f-4e2d-beeb-b69f52c3f8e6","Ma_cs":524,"Serial_cs":"HCM-29","Loai_cs":2,"Loai_cs_disabled":false,"Ma_nv_cd":"","Da_xn":false,"Ma_da":7,"Stt":"8734","Ma_congdong":"","Ma_XNSL":"CĐ-HCM-29-08734","Noi_gt":[4],"Da_tc":false,"Nguon_kinh_phi":7,"isBosung":false},"DS_nguyco":[14,13],"Nguyco_khac":"","DS_Hanhvi":[3],"Hanhvi_Khac":"","Nguyco_chinh":13,"Tuvan_btbc":{},"Xac_minh":{},"TV_SXN":{},"KQ_Xetnghiem":0,"Khachhang_id":726079,"duan_sc":2,"isHanhvi_Khac":false,"isNguyco_khac":false,"unlocked":""}
function AddTiepDon(khInput: CustomerDto, nhanVienList: any[]) {
    const staffId = nhanVienList.find(nv => nv.Manv == khInput.maNhanVien)?.id; // hard code => Le Cong Tam
    const directorStaffId = nhanVienList.find(nv => nv.Manv == null)?.id; // hard code => Le Cong Tam

    const requestBody: AddTiepDonRequestDto = new AddTiepDonRequestDto();
    requestBody.Nguyco_khac = '';
    requestBody.Hanhvi_Khac = '';
    requestBody.Nguyco_chinh = 13;
    requestBody.Tuvan_btbc = {};
    requestBody.Xac_minh = {};
    requestBody.TV_SXN = {};
    requestBody.KQ_Xetnghiem = 0;
    requestBody.duan_sc = 2;
    requestBody.isHanhvi_Khac = false;
    requestBody.isNguyco_khac = false;
    requestBody.unlocked = "";
    requestBody.DS_nguyco = [13];
    requestBody.DS_Hanhvi = [3];

    var tt_Hanhchinh: TT_Hanhchinh = new TT_Hanhchinh();

    Object.assign(tt_Hanhchinh, {
        CCCD: khInput.cmnd,
        Gioitinh: khInput.gioiTinh?.toLowerCase() == 'nam' ? 1 : 2,
        Hoten: toTitleCase(khInput.hoTen || ''),
        Namsinh: khInput.namSinh,
        Ngaysinh: `${khInput.namSinh}-12-31T17:00:00.000Z`,
        Solienhe: khInput.dienThoai,
        UIC: createUic(khInput.hoTen, khInput.namSinh),
        checkDC: false,
        loai_giay_to: 1
    });
    tt_Hanhchinh.Diachi = {
        Sonha: ''
    };
    tt_Hanhchinh.Hokhau = {
        Sonha: ''
    };
    requestBody.TT_Hanhchinh = tt_Hanhchinh;

    requestBody.Tiensu_XNDT = {
        Tiensu_XN: 1,
        Ngay_XN_HIV: "",
        Trangthai_PrEP: "",
        Trangthai_ARV: "",
        Chuyengui_ARV: "",
        XN_Lai: "",
        tx_ma_xnkd: ""
    }

    requestBody.TT_Tiepdon = {
        Da_tc: false,
        Da_xn: false,
        Loai_cs: 1, // Default value if not provided
        Loai_cs_disabled: false,
        Ma_SNS: '',
        Ma_XNSL: `KC-${khInput.maLayTest}`,
        Ma_congdong: '',
        Ma_cs: 524,
        Ma_da: '',
        Ma_nv_cd: staffId,
        Ma_nv_td: directorStaffId, // hard code => Tran Thanh Huu
        Ngay_td: convertDate(khInput?.ngayXNCongDong), // "2025-04-01T17:00:00.000Z"
        Nguon_kinh_phi: 7,
        Noi_gt: [1],
        Serial_cs: 'HCM-29',
        Stt: khInput.maTiepDon,
        isBosung: false
    };

    if(tt_Hanhchinh.Gioitinh == 2) {
        requestBody.Hanhvi_Khac = "Bạn tình nhiễm HIV";
        requestBody.DS_nguyco = [16];
        requestBody.DS_Hanhvi = [5];
    }

    return axios.post(`https://xnhiv.vn/elog-api/Data/Add_Tiepdon`, requestBody, {
        headers: {
            'Authorization': bearerToken,
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        httpsAgent
    }).then(res => {
        // Call API SaveCCCD
        if (res.data.CodeName == 'SUCCESS') {
            console.log(res.data);
            return {
                tiepDonId: res.data.Data,
                staffId
            };
        } else {
            writeLog(`Lỗi khi thêm tiếp đón cho khách hàng ${khInput.hoTen} - ${khInput.namSinh}: ${res.data.ErrMessage}`);
        }
    }).catch(err => {
        writeLog(`Lỗi khi thêm tiếp đón cho khách hàng ${khInput.hoTen} - ${khInput.namSinh}: ${err.message}`);
    });
}

function CallApiSaveXetNghiemSL(tiepDonId: string, kh: CustomerDto) {
    const options = {
        headers: {
            'Accept': 'application/json',
            'Authorization': bearerToken
        },
        httpsAgent
    };

    return axios.get(`https://xnhiv.vn/elog-api/Data/Get_Tiepdon_Info?iTiepdon_id=${tiepDonId}`, options)
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
                        "Ma_XNKD": `CĐ-${kh.maVCT}`, // "CĐ-HCM-29-08221"
                        "Ngay_XNKD": toUTCISOString(dTmp.Data.TT_Tiepdon.Ngay_td),
                        "Hinhthuc_xn": 3,
                        "CSYT_Id": 524,
                        "CSYT_Name": "",
                        "Tinh_id": 79,
                        "KQ_Cuoicung": 1
                    },
                    "TT_Chuyengui": {
                        "Sudung": 1,
                        "LoaihinhXN_Id": 3,
                        "Tinh_id": 79,
                        "CSXN_Id": 524,
                        "CSXN_Name": "",
                        "Ngay_DK": toUTCISOString(dTmp.Data.TT_Tiepdon.Ngay_td),
                        "CS_Chuyengui": 524,
                        "File_cg": "1748524394635_file.png"
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

            return axios.post('https://xnhiv.vn/elog-api/Data/Save_XetNghiemSL', data, options)
                .then((res) => {
                    var dto = res.data;

                    if (dto.CodeName == 'SUCCESS') {
                        // CallApiSave_TVSXN(tiepDonId, dTmp.Data.TT_Tiepdon.Ma_nv_cd, ngayTd);
                        return {
                            khachHangId: Khachhang_id,
                            data: res.data
                        };
                    }
                }).catch((err) => {
                    console.error(err);
                });
        })
}




// var danhSachKhachHangConLai: CustomerDto[] = [];
// runJob();


// step 2: Call API GET https://xnhiv.vn/elog-api/Data/SearchTTKH
// HoTen=&NamSinh=&GioiTinh=1&Ma_XNSL=&Ma_XNKD=&Ma_DieuTri=&CSYT_id=524&Tinh_id=&Quanhuyen_id=&Xaphuong_id=&iPage=0&iRecordOfPage=10000



// step 4: Call API GET https://xnhiv.vn/elog-api/Data/SaveCCCD
// iTiepdon_id=&CCCD=&loai_giay_to=&HK_Sonha=&HK_Tinh_id=&HK_Quanhuyen_id=&HK_Xaphuong_id=&DC_Sonha=&DC_Tinh_id=&DC_Quanhuyen_id=&DC_Xaphuong_id=
// function SaveCCCD (iTiepdon_id: number, khInput: CustomerDto) {
//     const params = { 
//     }
// };

// step 5: Call API POST https://xnhiv.vn/elog-api/Data/Save_XetNghiemKD
// example request body {"Sangloc":{"Tiepdon_id":957978,"Khachhang_id":726079,"TT_XN_Khangdinh":{"Tinh_id":0},"TT_Chuyengui":{},"IsCopyCG":false},"Khangdinh":{"Tiepdon_id":957978,"Khachhang_id":726079,"Ma_cs":524,"Ma_khangdinh":"CĐ-HCM-29-08734","Ngay_xn":"","Ngay_cs_nhan_kq":"","KQ_Huyetthanh":"","KQ_PCR":"","XN_PCR_Bosung":"","KQ_PCR_BS":"","XN_Nhiemmoi":"","KQ_Nhiemmoi":"","KQ_TLVR":"","KQ_TLVR_lydo":"","Ngay_TLVR":"","Giatri_TLVR":"","Duonglay_HIV":"","Du_dk_Nhiemmoi":"","Hinhthuc_xn":2,"KQ_Sangloc":1,"NSP_Sangloc":7,"KQ_KN_KT":"","Chiase":"","TT_XN_Khangdinh":{"CSYT_Id":524,"Tinh_id":79},"XNSL_Lai":1,"KQ_Tuthuchien":"","Ngaynhan_SP":null,"Loaisp_khac":"","Loaisp_id":"","Hinhthuc_SP":"","LoaihinhXN_Id":5,"Sudung":1,"Du_dk_Nhiemmoi_lydo":"","XN_Nhiemmoi_lydo":"","SL_Nhiemmoi":"","SL_Nhiemmoi_lydo_id":"","nhap_tlvr_only":false,"nhap_xnkd_only":false,"KQ_KD_NM":"","IsChuyenGui":false,"Sangloc":{"Tiepdon_id":957978,"Khachhang_id":726079,"TT_XN_Khangdinh":{"Tinh_id":0},"TT_Chuyengui":{},"IsCopyCG":false}},"Type":0}
// function SaveXetNghiemKD(tiepDonId: number, khInput: CustomerDto, khachHangId?: number) {
//     var requestDto: SaveXetNghiemKDRequestDto = new SaveXetNghiemKDRequestDto();
//     requestDto.Sangloc = {};
//     requestDto.Sangloc.Tiepdon_id = tiepDonId;
//     requestDto.Sangloc.Khachhang_id = khachHangId; // Default to 0 if not provided
//     requestDto.Sangloc.TT_XN_Khangdinh = {};
//     requestDto.Sangloc.TT_XN_Khangdinh.Tinh_id = 0; // Default to 0 if not provided
//     requestDto.Sangloc.IsCopyCG = false;
//     requestDto.Khangdinh = {
//         Tiepdon_id: tiepDonId,
//         Khachhang_id: khachHangId, // Default to 0 if not provided
//         Ma_cs: 524, // Default value if not provided
//         Ma_khangdinh: `CĐ-HCM-29-0${khInput.maTiepDon}`, // Example value, replace with actual
//         Hinhthuc_xn: 2, // Default value if not provided
//         KQ_Sangloc: 1, // Default value if not provided
//         NSP_Sangloc: 7, // Default value if not provided
//         TT_XN_Khangdinh: {
//             CSYT_Id: 524, // Default value if not provided
//             Tinh_id: 79 // Default value if not provided
//         },
//         XNSL_Lai: 1, // Default value if not provided
//         LoaihinhXN_Id: 5, // Default value if not provided
//         Sudung: 1, // Default value if not provided
//         nhap_tlvr_only: false,
//         nhap_xnkd_only: false,
//         IsChuyenGui: false,
//         Sangloc: requestDto.Sangloc
//     };
//     requestDto.Type = 0;

//     axios.post(`https://xnhiv.vn/elog-api/Data/Save_XetNghiemKD`, requestDto, {
//         headers: {
//             'Authorization': bearerToken,
//             Accept: 'application/json',
//             'Content-Type': 'application/json'
//         },
//         httpsAgent
//     }).then(res => {
//         saveDieuTri(tiepDonId, khachHangId || 0, khInput);
//     }).catch(err => {
//         writeLog(`Lỗi khi lưu kết quả xét nghiệm: ${err.message}`);
//     });
// }


// // step 6: Call API https://xnhiv.vn/elog-api/Data/Save_Dieutri
// // example request body {"PrEP":{"Khachhang_id":726079,"Tiepdon_id":957978,"Ngay_tuvan":"2025-04-14T17:00:00.000Z","Ma_nv":"8d0cc781-242f-4e2d-beeb-b69f52c3f8e6","Ngay_tra_kq":"2025-04-14T17:00:00.000Z"}}
function saveDieuTri(tiepDonId: number, khachHangId: number, khInput?: CustomerDto, staffId?: string) {
    var requestDto: SaveDieuTriRequestDto = new SaveDieuTriRequestDto();

    requestDto = {
        "PrEP": {
            "Khachhang_id": khachHangId,
            "Tiepdon_id": tiepDonId,
            "Ngay_tuvan": convertDate(khInput?.ngayCG),
            "Ma_nv": staffId,
            "Ngay_tra_kq": convertDate(khInput?.ngayCG),
            "PrEP_danhgia": 1,
            "PrEP_dieukien": 1,
            "PrEP_Dong_y": 1,
            "PrEP_Lydo": "",
            "PrEP_Ngay_dk": convertDate(khInput?.ngayCG),
            "PrEP_Ma": khInput?.maPrep,
            "PrEP_Coso": "TestSGN",
            "Loai_dv": "",
            "nPEP_Dong_y": "",
            "nPEP_Lydo": "",
            "nPEP_Ngay_dk": "",
            "nPEP_Ma": "",
            "nPEP_Coso": "",
            "Chuyen_gui_khac": ""
        }
    };

    return axios.post(`https://xnhiv.vn/elog-api/Data/Save_Dieutri`, requestDto, {
        headers: {
            'Authorization': bearerToken,
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        httpsAgent
    }).then(res => {
        return res.data;
    }).catch(err => {
        writeLog(`Lỗi khi lưu điều trị cho khách hàng ${khInput?.hoTen} - ${khInput?.namSinh}: ${err.message}`);
    });
}


// step 7: Call API https://xnhiv.vn/elog-api/Data/SaveCCCD
// iTiepdon_id=&CCCD=&loai_giay_to=&HK_Sonha=&HK_Tinh_id=&HK_Quanhuyen_id=&HK_Xaphuong_id=&DC_Sonha=&DC_Tinh_id=&DC_Quanhuyen_id=&DC_Xaphuong_id=





// common functions 
function toUTCISOString(localDateTime?: string): string {
    if (!localDateTime) {
        localDateTime = '';
    }

    return new Date(localDateTime).toISOString();
}

function convertDate(input?: string): string {
    if (!input) {
        return '';
    }

    console.log(`Converting date: ${input}`);

    const [day, month, year] = input.split('/').map(Number);
    // Create date in UTC
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setHours(date.getHours() - 7); // Adjust for UTC+7 timezone
    return date.toISOString();
}

function createUic(fullName?: string, yearOfBirth?: number) {
    var nameParts = fullName?.split(' ');
    var last2DigitYOB = `${yearOfBirth}`.substr(2, 2);

    if (!nameParts || nameParts.length == 1) return '';

    var firstName = nameParts[0];
    var lastName = nameParts[nameParts.length - 1];

    return removeVietnameseTones(`${firstName[0]}${firstName[2] || '9'}${lastName[0]}${lastName[2] || '9'}10101${last2DigitYOB}`);
}

function removeVietnameseTones(str: string) {
    return str
        .normalize("NFD")                      // Tách ký tự và dấu
        .replace(/[\u0300-\u036f]/g, "")       // Loại bỏ dấu
        .replace(/đ/g, "d").replace(/Đ/g, "D"); // Thay đ → d, Đ → D
}

function toTitleCase(str: string) {
    return str
        .toLowerCase() // Convert entire string to lowercase
        .split(' ')     // Split into words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter
        .join(' ');     // Join words back
}

function XacMinh(tiepDonId: number, kh: CustomerDto) {
    const data = {
        Tiepdon_id: tiepDonId,
        PrEP_dieutri_lai: 1,
        PrEP_Ngay_xm: convertDate(kh.ngayCG),
        Duongtinh_cu: 0,
        ARV_Ngay_xm: null,
        Trangthai_Arv: 0
    };

    return axios.post('https://xnhiv.vn/elog-api/Data/Xacminh', data, {
        headers: {
            'Authorization': bearerToken,
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        httpsAgent
    }).then(res => {
        return res.data;
    }).catch(err => {
        writeLog(`Lỗi khi xác minh tiếp đón ${tiepDonId}: ${err.message}`);
    });
}


// Function to call the API
// iRecordOfPage=50&iPage=0&sortOrder=ascending&sortProp=Ngay_td&From=2025-03-31T17%3A00%3A00.000Z&To=2025-05-30T17%3A00%3A00.000Z&CSYT_Id=524&Tinh_id=79&Quanhuyen_id=&Xaphuong_id=&TrangThai=&tlvr_state=1&Time=1&iSearchInfo=0707526504
// export async function getTiepdon(
//     req: GetTiepdonRequestDto,
//     bearerToken: string,
//     httpsAgent: https.Agent
// ) {
//     const params = { ...req };
//     return axios.get<GetTiepdonResponseDto>(
//         'https://xnhiv.vn/elog-api/Data/Get_Tiepdon',
//         {
//             params,
//             headers: {
//                 'Authorization': bearerToken,
//                 Accept: 'application/json',
//                 'Content-Type': 'application/json'
//             },
//             httpsAgent
//         }
//     ).then(res => {
//         return res.data;
//     }).catch(err => {
//         writeLog(`Lỗi khi lấy danh sách tiếp đón: ${err.message}`);
//         return null;
//     });
// }

// // DELETE https://xnhiv.vn/elog-api/Data/Delete_Tiepdon/961746
// export async function deleteTiepdon(tiepDonId: number) {
//     return axios.delete(`https://xnhiv.vn/elog-api/Data/Delete_Tiepdon/${tiepDonId}`, {
//         headers: {
//             'Authorization': bearerToken,
//             Accept: 'application/json',
//             'Content-Type': 'application/json'
//         },
//         httpsAgent
//     }).then(res => {
//         return res.data;
//     }).catch(err => {
//         writeLog(`Lỗi khi xóa tiếp đón ${tiepDonId}: ${err.message}`);
//         return null;
//     });
// }




// var phoneNumbers = [
//     "0932136971",
//     "0822898229",
//     "0943888551",
//     "0901435579",
//     "0834062403",
//     "0703687730"
// ];

// phoneNumbers.forEach((phoneNumber, index) => {
//     setTimeout(() => {
//         getTiepdon({
//             iRecordOfPage: 50,
//             iPage: 0,
//             sortOrder: 'ascending',
//             sortProp: 'Ngay_td',
//             From: '2025-03-31T17:00:00.000Z',
//             To: '2025-05-30T17:00:00.000Z',
//             CSYT_Id: 524,
//             Tinh_id: 79,
//             Quanhuyen_id: '',
//             Xaphuong_id: '',
//             TrangThai: '',
//             tlvr_state: 1,
//             Time: 1,
//             iSearchInfo: phoneNumber
//         }, bearerToken, httpsAgent).then(res => {
//             var dto = res?.Data?.Data;

//             dto?.filter(item => item.Ma_congdong == "").forEach(item => {
//                 deleteTiepdon(item.Id || 0).then(deleteRes => {
//                     if (deleteRes?.CodeName == 'SUCCESS') {
//                         console.log(`Đã xóa tiếp đón với ID: ${item.Id}`);
//                     }
//                 }).catch(err => {
//                     console.log(`Lỗi khi xóa tiếp đón với ID ${item.Id}: ${err.message}`);
//                 });
//             });
//         });
//     }, index * 1000);
// });