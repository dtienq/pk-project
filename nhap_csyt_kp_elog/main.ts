import axios from "axios";
import { CustomerDto } from "./CustomerDto";
// import fs from 'fs';
import * as fs from 'fs';
import * as https from 'https';
import { ThongTinKhachHangDto } from "./XetNghiemLamSangDto";
const converter = require('json-2-csv');

const bearerToken =
    `Bearer 2uw6OYU9GwjyhxrTCoptdHvIANW58O9GrkqQ1HPzdCXUJKdFQlz4hCHhQl8QqXfyTDZcVDHjEJYucgA5rygKNzc9tSFTrqQ7S9veKnSW0m37OmKOmROe9EmCFlASmSXiTIdQrqeCG+xiIhFLl4JYbLj5HsdU/RPnpwIhvr7nnpbx9Hvtw12QKK1PErL6g9OCO+AZjTdFFAypycPNjTJNdjh2ZNYp8zC5X29KB8hMBFUkUxvIzKHOMw==`;

const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

// step 1: Lấy họ tên, Năm sinh, Giới tính từ file CSV => danhSachKhachHang
var fileContent = fs.readFileSync('./input_data.csv', 'utf8');
fileContent = fileContent.replace('\r\n', '\n');
fileContent = fileContent.replace('\r', '');
const danhSachKhachHang: CustomerDto[] = converter.csv2json(fileContent);

// step 2: Call API GET https://xnhiv.vn/elog-api/Data/SearchTTKH
// HoTen=&NamSinh=&GioiTinh=1&Ma_XNSL=&Ma_XNKD=&Ma_DieuTri=&CSYT_id=524&Tinh_id=&Quanhuyen_id=&Xaphuong_id=&iPage=0&iRecordOfPage=10000
axios.get(`https://xnhiv.vn/elog-api/Data/SearchTTKH`, {
    headers: {
        'Authorization': bearerToken,
        Accept: 'application/json'
    },
    params: {
        HoTen: danhSachKhachHang[0].fullName,
        NamSinh: danhSachKhachHang[0].yearOfBirth,
        GioiTinh: danhSachKhachHang[0].sex?.toLowerCase() == 'nam' ? 1 : 2,
        CSYT_id: 524,
        iPage: 0,
        iRecordOfPage: 10000
    },
    httpsAgent
}).then(res => {
    var ThongTinKhachHangList: ThongTinKhachHangDto[] = res.data.Data.Data;

    if (ThongTinKhachHangList.length == 0) {
        console.log(`Không tìm thấy khách hàng ${danhSachKhachHang[0].fullName} - ${danhSachKhachHang[0].yearOfBirth}`);
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

    AddTiepDon(dto);
    
}).catch(err => {
    console.log(err.message);
})

// step 3: Call API POST https://xnhiv.vn/elog-api/Data/Add_Tiepdon
// example request body: {"TT_Hanhchinh":{"Hoten":"Trần Trọng Trạng","Gioitinh":1,"Namsinh":1997,"Ngaysinh":"1997-01-01T00:00:00+07:00","Solienhe":"0938185915","CCCD":"096097009507","loai_giay_to":1,"Nghenghiep_id":0,"Dantoc_id":0,"UIC":"TATA1010197","Diachi":{"Sonha":"","Xaphuong_id":0,"Tinh_id":0,"Quanhuyen_id":0,"Diachi":"","Ten_Xaphuong":null},"Hokhau":{"Sonha":"","Xaphuong_id":0,"Tinh_id":0,"Quanhuyen_id":0,"Diachi":"","Ten_Xaphuong":null},"checkDC":false},"Tiensu_XNDT":{"Tiensu_XN":2,"Ngay_XN_HIV":"2025-02-16T17:00:00.000Z","Trangthai_PrEP":2,"Trangthai_ARV":0,"Chuyengui_ARV":0,"XN_Lai":0,"tx_ma_xnkd":""},"TT_Tiepdon":{"Ngay_td":"2025-04-14T17:00:00.000Z","Ma_nv_td":"8d0cc781-242f-4e2d-beeb-b69f52c3f8e6","Ma_cs":524,"Serial_cs":"HCM-29","Loai_cs":2,"Loai_cs_disabled":false,"Ma_nv_cd":"","Da_xn":false,"Ma_da":7,"Stt":"8734","Ma_congdong":"","Ma_XNSL":"CĐ-HCM-29-08734","Noi_gt":[4],"Da_tc":false,"Nguon_kinh_phi":7,"isBosung":false},"DS_nguyco":[14,13],"Nguyco_khac":"","DS_Hanhvi":[3],"Hanhvi_Khac":"","Nguyco_chinh":13,"Tuvan_btbc":{},"Xac_minh":{},"TV_SXN":{},"KQ_Xetnghiem":0,"Khachhang_id":726079,"duan_sc":2,"isHanhvi_Khac":false,"isNguyco_khac":false,"unlocked":""}
function AddTiepDon(dto: ThongTinKhachHangDto | null) {
    console.log(`Bắt đầu thêm tiếp đón cho khách hàng: ${JSON.stringify(dto)}`);

    // const requestBody = {
    //     TT_Hanhchinh: {
    //         Hoten: dto.Hoten,
    //         Gioitinh: dto.Gioitinh,
    //         Namsinh: dto.Namsinh,
    //         Ngaysinh: dto.Ngaysinh,
    //         Solienhe: dto.Solienhe,
    //         CCCD: dto.CCCD,
    //         loai_giay_to: dto.loai_giay_to || 1,
    //         Nghenghiep_id: dto.Nghenghiep_id || 0,
    //         Dantoc_id: dto.Dantoc_id || 0,
    //         UIC: dto.uic || '',
    //         Diachi: {
    //             Sonha: dto.DC_Sonha || '',
    //             Xaphuong_id: dto.DC_Xaphuong_id || 0,
    //             Tinh_id: dto.DC_Tinh_id || 0,
    //             Quanhuyen_id: dto.DC_Quanhuyen_id || 0,
    //             Diachi: dto.Diachi || '',
    //             Ten_Xaphuong: null
    //         },
    //         Hokhau: {
    //             Sonha: dto.HK_Sonha || '',
    //             Xaphuong_id: dto.HK_Xaphuong_id || 0,
    //             Tinh_id: dto.HK_Tinh_id || 0,
    //             Quanhuyen_id: dto.HK_Quanhuyen_id || 0,
    //             Diachi: dto.Hokhau || '',
    //             Ten_Xaphuong: null
    //         },
    //         checkDC: false
    //     },
    //     Tiensu_XNDT: {
    //         Tiensu_XN: dto.Tiensu_XN || 2, // Default value if not provided
    //         Ngay_XN_HIV: new Date().toISOString(), // Current date as example
    //         Trangthai_PrEP: dto.Trangthai_PrEP || 2, // Default value if not provided
    //         Trangthai_ARV: dto.Trangthai_ARV || 0, // Default value if not provided
    //         Chuyengui_ARV: 0, // Default value if not provided
    //         XN_Lai: 0, // Default value if not provided
    //         tx_ma_xnkd: '' // Default value if not provided
    //     },
    //     TT_Tiepdon: {
    //         Ngay_td: new Date().toISOString(), // Current date as example
    //         Ma_nv_td: '8d0cc781-
}


// step 4: Call API GET https://xnhiv.vn/elog-api/Data/SaveCCCD
// iTiepdon_id=&CCCD=&loai_giay_to=&HK_Sonha=&HK_Tinh_id=&HK_Quanhuyen_id=&HK_Xaphuong_id=&DC_Sonha=&DC_Tinh_id=&DC_Quanhuyen_id=&DC_Xaphuong_id=

// step 5: Call API POST https://xnhiv.vn/elog-api/Data/Save_XetNghiemKD
// example request body {"Sangloc":{"Tiepdon_id":957978,"Khachhang_id":726079,"TT_XN_Khangdinh":{"Tinh_id":0},"TT_Chuyengui":{},"IsCopyCG":false},"Khangdinh":{"Tiepdon_id":957978,"Khachhang_id":726079,"Ma_cs":524,"Ma_khangdinh":"CĐ-HCM-29-08734","Ngay_xn":"","Ngay_cs_nhan_kq":"","KQ_Huyetthanh":"","KQ_PCR":"","XN_PCR_Bosung":"","KQ_PCR_BS":"","XN_Nhiemmoi":"","KQ_Nhiemmoi":"","KQ_TLVR":"","KQ_TLVR_lydo":"","Ngay_TLVR":"","Giatri_TLVR":"","Duonglay_HIV":"","Du_dk_Nhiemmoi":"","Hinhthuc_xn":2,"KQ_Sangloc":1,"NSP_Sangloc":7,"KQ_KN_KT":"","Chiase":"","TT_XN_Khangdinh":{"CSYT_Id":524,"Tinh_id":79},"XNSL_Lai":1,"KQ_Tuthuchien":"","Ngaynhan_SP":null,"Loaisp_khac":"","Loaisp_id":"","Hinhthuc_SP":"","LoaihinhXN_Id":5,"Sudung":1,"Du_dk_Nhiemmoi_lydo":"","XN_Nhiemmoi_lydo":"","SL_Nhiemmoi":"","SL_Nhiemmoi_lydo_id":"","nhap_tlvr_only":false,"nhap_xnkd_only":false,"KQ_KD_NM":"","IsChuyenGui":false,"Sangloc":{"Tiepdon_id":957978,"Khachhang_id":726079,"TT_XN_Khangdinh":{"Tinh_id":0},"TT_Chuyengui":{},"IsCopyCG":false}},"Type":0}

// step 6: Call API https://xnhiv.vn/elog-api/Data/Save_Dieutri
// example request body {"PrEP":{"Khachhang_id":726079,"Tiepdon_id":957978,"Ngay_tuvan":"2025-04-14T17:00:00.000Z","Ma_nv":"8d0cc781-242f-4e2d-beeb-b69f52c3f8e6","Ngay_tra_kq":"2025-04-14T17:00:00.000Z"}}

// step 7: Call API https://xnhiv.vn/elog-api/Data/SaveCCCD
// iTiepdon_id=&CCCD=&loai_giay_to=&HK_Sonha=&HK_Tinh_id=&HK_Quanhuyen_id=&HK_Xaphuong_id=&DC_Sonha=&DC_Tinh_id=&DC_Quanhuyen_id=&DC_Xaphuong_id=


