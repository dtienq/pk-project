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
const converter = require('json-2-csv');

const bearerToken =
    `Bearer 2uw6OYU9GwjyhxrTCoptdHvIANW58O9GrkqQ1HPzdCXUJKdFQlz4hCHhQl8QqXfyTDZcVDHjEJYucgA5rygKNzc9tSFTrqQ7S9veKnSW0m37OmKOmROe9EmCFlASmSXiUjx1zuVRR+qhMtG9UANQnnrW2PmCYSFopwIhvr7nnpbx9Hvtw12QKJoNkEmtN2tVAiFq2p4WOEcXOsfZQb2nZv3kbOef5GsQOsf0Csyv2RQkUxvIzKHOMw==`;

const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

// step 1: Lấy họ tên, Năm sinh, Giới tính từ file CSV => danhSachKhachHang
console.log("Start running job nhap_csyt_kp_elog...");
var fileContent = fs.readFileSync('./input_data.csv', 'utf8');
fileContent = fileContent.replace(/\r\n/g, '\n');
fileContent = fileContent.replace(/\r/g, '');
var danhSachKhachHang: CustomerDto[] = converter.csv2json(fileContent);
var danhSachKhachHangConLai: CustomerDto[] = Object.assign([], danhSachKhachHang);

// step 2: Call API GET https://xnhiv.vn/elog-api/Data/SearchTTKH
// HoTen=&NamSinh=&GioiTinh=1&Ma_XNSL=&Ma_XNKD=&Ma_DieuTri=&CSYT_id=524&Tinh_id=&Quanhuyen_id=&Xaphuong_id=&iPage=0&iRecordOfPage=10000
var count = 0;
danhSachKhachHang.forEach((kh: CustomerDto) => {
    setTimeout(() => {
        axios.get(`https://xnhiv.vn/elog-api/Data/SearchTTKH`, {
            headers: {
                'Authorization': bearerToken,
                Accept: 'application/json'
            },
            params: {
                HoTen: kh.fullName,
                NamSinh: kh.yearOfBirth,
                GioiTinh: kh.sex?.toLowerCase() == 'nam' ? 1 : 2,
                CSYT_id: 524,
                iPage: 0,
                iRecordOfPage: 10000
            },
            httpsAgent
        }).then(res => {
            var ThongTinKhachHangList: ThongTinKhachHangDto[] = res.data.Data.Data;

            ThongTinKhachHangList = ThongTinKhachHangList
                .filter(t => t.Hoten?.toLowerCase() == kh.fullName?.toLowerCase()
                            && t.Namsinh == kh.yearOfBirth);

            if (ThongTinKhachHangList.length == 0) {
                writeLog(`Không tìm thấy khách hàng ${kh.fullName} - ${kh.yearOfBirth}`);
                return;
            }

            // Lấy dto có Ma_XNSL 4 ký tự cuối lớn nhất
            const maxDtoObj = ThongTinKhachHangList
                .filter(t => t.Ma_XNSL && t.Ma_XNSL.length >= 4)
                .map(t => ({
                    dto: t,
                    last4: parseInt(t.Ma_XNSL?.slice(-4) || '0', 10)
                }))
                .reduce<{ dto: ThongTinKhachHangDto | null; last4: number }>((max, curr) => (curr.last4 > max.last4 ? curr : max), { dto: null, last4: -1 });

            const dto = maxDtoObj.dto;

            AddTiepDon(dto, kh);
        }).catch(err => {
            writeLog(`Lỗi khi tìm kiếm thông tin khách hàng ${kh.fullName} - ${kh.yearOfBirth}: ${err.message}`);
        });
    }, (count++) * 1000);
});

// step 3: Call API POST https://xnhiv.vn/elog-api/Data/Add_Tiepdon
// example request body: {"TT_Hanhchinh":{"Hoten":"Trần Trọng Trạng","Gioitinh":1,"Namsinh":1997,"Ngaysinh":"1997-01-01T00:00:00+07:00","Solienhe":"0938185915","CCCD":"096097009507","loai_giay_to":1,"Nghenghiep_id":0,"Dantoc_id":0,"UIC":"TATA1010197","Diachi":{"Sonha":"","Xaphuong_id":0,"Tinh_id":0,"Quanhuyen_id":0,"Diachi":"","Ten_Xaphuong":null},"Hokhau":{"Sonha":"","Xaphuong_id":0,"Tinh_id":0,"Quanhuyen_id":0,"Diachi":"","Ten_Xaphuong":null},"checkDC":false},"Tiensu_XNDT":{"Tiensu_XN":2,"Ngay_XN_HIV":"2025-02-16T17:00:00.000Z","Trangthai_PrEP":2,"Trangthai_ARV":0,"Chuyengui_ARV":0,"XN_Lai":0,"tx_ma_xnkd":""},"TT_Tiepdon":{"Ngay_td":"2025-04-14T17:00:00.000Z","Ma_nv_td":"8d0cc781-242f-4e2d-beeb-b69f52c3f8e6","Ma_cs":524,"Serial_cs":"HCM-29","Loai_cs":2,"Loai_cs_disabled":false,"Ma_nv_cd":"","Da_xn":false,"Ma_da":7,"Stt":"8734","Ma_congdong":"","Ma_XNSL":"CĐ-HCM-29-08734","Noi_gt":[4],"Da_tc":false,"Nguon_kinh_phi":7,"isBosung":false},"DS_nguyco":[14,13],"Nguyco_khac":"","DS_Hanhvi":[3],"Hanhvi_Khac":"","Nguyco_chinh":13,"Tuvan_btbc":{},"Xac_minh":{},"TV_SXN":{},"KQ_Xetnghiem":0,"Khachhang_id":726079,"duan_sc":2,"isHanhvi_Khac":false,"isNguyco_khac":false,"unlocked":""}
function AddTiepDon(dto: ThongTinKhachHangDto | null, khInput: CustomerDto) {
    const requestBody: AddTiepDonRequestDto = new AddTiepDonRequestDto();
    requestBody.Nguyco_khac = '';
    requestBody.Hanhvi_Khac = '';
    requestBody.Nguyco_chinh = 13;
    requestBody.Tuvan_btbc = {};
    requestBody.Xac_minh = {};
    requestBody.TV_SXN = {};
    requestBody.KQ_Xetnghiem = 0;
    requestBody.Khachhang_id = dto?.khach_hang_ref_id || null;
    requestBody.duan_sc = 2;
    requestBody.isHanhvi_Khac = false;
    requestBody.isNguyco_khac = false;
    requestBody.unlocked = "";
    requestBody.DS_nguyco = [14, 13];
    requestBody.DS_Hanhvi = [3];

    var tt_Hanhchinh: TT_Hanhchinh = new TT_Hanhchinh();

    Object.assign(tt_Hanhchinh, {
        Hoten: dto?.Hoten || '',
        Gioitinh: dto?.Gioitinh || '',
        Namsinh: dto?.Namsinh || '',
        Ngaysinh: dto?.Ngaysinh || '',
        Solienhe: dto?.Solienhe || '',
        CCCD: dto?.CCCD || '',
        loai_giay_to: dto?.loai_giay_to || '',
        Nghenghiep_id: dto?.Nghenghiep_id || '',
        Dantoc_id: dto?.Dantoc_id || '',
        UIC: dto?.uic || '',
        checkDC: false
    });
    tt_Hanhchinh.Diachi = {
        Sonha: dto?.DC_Sonha || '',
        Xaphuong_id: dto?.DC_Xaphuong_id || 0,
        Tinh_id: dto?.DC_Tinh_id || 0,
        Quanhuyen_id: dto?.DC_Quanhuyen_id || 0,
        Diachi: dto?.Diachi || '',
        Ten_Xaphuong: dto?.DC_TenXaPhuong || ''
    };
    tt_Hanhchinh.Hokhau = {
        Sonha: dto?.HK_Sonha || '',
        Xaphuong_id: dto?.HK_Xaphuong_id || 0,
        Tinh_id: dto?.HK_Tinh_id || 0,
        Quanhuyen_id: dto?.HK_Quanhuyen_id || 0,
        Diachi: dto?.Hokhau || '',
        Ten_Xaphuong: dto?.HK_TenXaPhuong || ''
    };
    requestBody.TT_Hanhchinh = tt_Hanhchinh;

    requestBody.Tiensu_XNDT = {
        Tiensu_XN: dto?.Tiensu_XN, // Default value if not provided
        Ngay_XN_HIV: toUTCISOString(dto?.Ngay_XN_HIV), // Current date as example
        Trangthai_PrEP: dto?.Trangthai_PrEP, // Default value if not provided
        Trangthai_ARV: dto?.Trangthai_ARV, // Default value if not provided
        Chuyengui_ARV: 0, // Default value if not provided
        XN_Lai: dto?.XetNghiem_Lai || 0, // Default value if not provided
        tx_ma_xnkd: dto?.tx_ma_xnkd || '' // Default value if not provided
    };

    requestBody.TT_Tiepdon = {
        Ngay_td: convertDate(khInput?.ngayTd),
        Ma_nv_td: '8d0cc781-242f-4e2d-beeb-b69f52c3f8e6', // hard code => Le Cong Tam 
        Ma_cs: dto?.Ma_cs || 524, // Default value if not provided
        Serial_cs: 'HCM-29', // Example value, replace with actual
        Loai_cs: 2, // Default value if not provided
        Loai_cs_disabled: false,
        Ma_nv_cd: '',
        Da_xn: false,
        Ma_da: 7, // Example value, replace with actual
        Stt: khInput?.maTiepDon || '', // Example value, replace with actual
        Ma_congdong: '',
        Ma_XNSL: `CĐ-HCM-29-0${khInput?.maTiepDon || ''}`, // Default value if not provided
        Noi_gt: [4],
        Da_tc: false,
        Nguon_kinh_phi: 7,
        isBosung: false
    };

    axios.post(`https://xnhiv.vn/elog-api/Data/Add_Tiepdon`, requestBody, {
        headers: {
            'Authorization': bearerToken,
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        httpsAgent
    }).then(res => {
        // Call API SaveCCCD
        if (res.data.CodeName == 'SUCCESS') {
            SaveXetNghiemKD(res.data.Data, khInput, dto?.Id);
        } else {
            writeLog(`Lỗi khi thêm tiếp đón cho khách hàng ${khInput.fullName} - ${khInput.yearOfBirth}: ${res.data.ErrMessage}`);
        }
    }).catch(err => {
        writeLog(`Lỗi khi thêm tiếp đón cho khách hàng ${khInput.fullName} - ${khInput.yearOfBirth}: ${err.message}`);
    });
}


// step 4: Call API GET https://xnhiv.vn/elog-api/Data/SaveCCCD
// iTiepdon_id=&CCCD=&loai_giay_to=&HK_Sonha=&HK_Tinh_id=&HK_Quanhuyen_id=&HK_Xaphuong_id=&DC_Sonha=&DC_Tinh_id=&DC_Quanhuyen_id=&DC_Xaphuong_id=
// function SaveCCCD (iTiepdon_id: number, khInput: CustomerDto) {
//     const params = { 
//     }
// };

// step 5: Call API POST https://xnhiv.vn/elog-api/Data/Save_XetNghiemKD
// example request body {"Sangloc":{"Tiepdon_id":957978,"Khachhang_id":726079,"TT_XN_Khangdinh":{"Tinh_id":0},"TT_Chuyengui":{},"IsCopyCG":false},"Khangdinh":{"Tiepdon_id":957978,"Khachhang_id":726079,"Ma_cs":524,"Ma_khangdinh":"CĐ-HCM-29-08734","Ngay_xn":"","Ngay_cs_nhan_kq":"","KQ_Huyetthanh":"","KQ_PCR":"","XN_PCR_Bosung":"","KQ_PCR_BS":"","XN_Nhiemmoi":"","KQ_Nhiemmoi":"","KQ_TLVR":"","KQ_TLVR_lydo":"","Ngay_TLVR":"","Giatri_TLVR":"","Duonglay_HIV":"","Du_dk_Nhiemmoi":"","Hinhthuc_xn":2,"KQ_Sangloc":1,"NSP_Sangloc":7,"KQ_KN_KT":"","Chiase":"","TT_XN_Khangdinh":{"CSYT_Id":524,"Tinh_id":79},"XNSL_Lai":1,"KQ_Tuthuchien":"","Ngaynhan_SP":null,"Loaisp_khac":"","Loaisp_id":"","Hinhthuc_SP":"","LoaihinhXN_Id":5,"Sudung":1,"Du_dk_Nhiemmoi_lydo":"","XN_Nhiemmoi_lydo":"","SL_Nhiemmoi":"","SL_Nhiemmoi_lydo_id":"","nhap_tlvr_only":false,"nhap_xnkd_only":false,"KQ_KD_NM":"","IsChuyenGui":false,"Sangloc":{"Tiepdon_id":957978,"Khachhang_id":726079,"TT_XN_Khangdinh":{"Tinh_id":0},"TT_Chuyengui":{},"IsCopyCG":false}},"Type":0}
function SaveXetNghiemKD(tiepDonId: number, khInput: CustomerDto, khachHangId?: number) {
    var requestDto: SaveXetNghiemKDRequestDto = new SaveXetNghiemKDRequestDto();
    requestDto.Sangloc = {};
    requestDto.Sangloc.Tiepdon_id = tiepDonId;
    requestDto.Sangloc.Khachhang_id = khachHangId; // Default to 0 if not provided
    requestDto.Sangloc.TT_XN_Khangdinh = {};
    requestDto.Sangloc.TT_XN_Khangdinh.Tinh_id = 0; // Default to 0 if not provided
    requestDto.Sangloc.IsCopyCG = false;
    requestDto.Khangdinh = {
        Tiepdon_id: tiepDonId,
        Khachhang_id: khachHangId, // Default to 0 if not provided
        Ma_cs: 524, // Default value if not provided
        Ma_khangdinh: `CĐ-HCM-29-0${khInput.maTiepDon}`, // Example value, replace with actual
        Hinhthuc_xn: 2, // Default value if not provided
        KQ_Sangloc: 1, // Default value if not provided
        NSP_Sangloc: 7, // Default value if not provided
        TT_XN_Khangdinh: {
            CSYT_Id: 524, // Default value if not provided
            Tinh_id: 79 // Default value if not provided
        },
        XNSL_Lai: 1, // Default value if not provided
        LoaihinhXN_Id: 5, // Default value if not provided
        Sudung: 1, // Default value if not provided
        nhap_tlvr_only: false,
        nhap_xnkd_only: false,
        IsChuyenGui: false,
        Sangloc: requestDto.Sangloc
    };
    requestDto.Type = 0;

    axios.post(`https://xnhiv.vn/elog-api/Data/Save_XetNghiemKD`, requestDto, {
        headers: {
            'Authorization': bearerToken,
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        httpsAgent
    }).then(res => {
        saveDieuTri(tiepDonId, khachHangId || 0, khInput);
    }).catch(err => {
        writeLog(`Lỗi khi lưu kết quả xét nghiệm: ${err.message}`);
    });
}


// step 6: Call API https://xnhiv.vn/elog-api/Data/Save_Dieutri
// example request body {"PrEP":{"Khachhang_id":726079,"Tiepdon_id":957978,"Ngay_tuvan":"2025-04-14T17:00:00.000Z","Ma_nv":"8d0cc781-242f-4e2d-beeb-b69f52c3f8e6","Ngay_tra_kq":"2025-04-14T17:00:00.000Z"}}
function saveDieuTri(tiepDonId: number, khachHangId: number, khInput?: CustomerDto) {
    var requestDto: SaveDieuTriRequestDto = new SaveDieuTriRequestDto();
    requestDto.PrEP = {
        Khachhang_id: khachHangId,
        Tiepdon_id: tiepDonId,
        Ngay_tuvan: convertDate(khInput?.ngayTd), // Current date as example
        Ma_nv: '8d0cc781-242f-4e2d-beeb-b69f52c3f8e6', // hard code => Le Cong Tam
        Ngay_tra_kq: convertDate(khInput?.ngayTd) // Current date as example
    }

    axios.post(`https://xnhiv.vn/elog-api/Data/Save_Dieutri`, requestDto, {
        headers: {
            'Authorization': bearerToken,
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        httpsAgent
    }).then(res => {
        console.log(`Lưu điều trị thành công cho khách hàng ${khInput?.fullName} - ${khInput?.yearOfBirth}`);
        writeLog(`Lưu điều trị thành công cho khách hàng ${khInput?.fullName} - ${khInput?.yearOfBirth}`);
        danhSachKhachHangConLai = danhSachKhachHangConLai.filter(kh => kh.fullName !== khInput?.fullName && kh.yearOfBirth !== khInput?.yearOfBirth);
        var csvStr = converter.json2csv(danhSachKhachHangConLai);
        fs.writeFileSync('./output_data.csv', csvStr, 'utf8');
    }).catch(err => {
        writeLog(`Lỗi khi lưu điều trị cho khách hàng ${khInput?.fullName} - ${khInput?.yearOfBirth}: ${err.message}`);
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

    const [day, month, year] = input.split('/').map(Number);
    // Create date in UTC
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setHours(date.getHours() - 7); // Adjust for UTC+7 timezone
    return date.toISOString();
}