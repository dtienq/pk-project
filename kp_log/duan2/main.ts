import axios, { AxiosRequestConfig } from 'axios';
import { AddTiepdonRequest, AddTiepdonResponse } from './AddTiepdonRequest';
import { Khangdinh, SaveXetNghiemKDRequest, SaveXetNghiemKDResponse, TT_XN_Khangdinh } from './SaveXetNghiemKD';
import https from 'https';
import { SaveCCCDRequest, SaveCCCDResponse } from './SaveCCCD';
import { PrEP, SaveDieutriRequest, SaveDieutriResponse } from './Save_Dieutri';
import { XacminhRequest, XacminhResponse } from './XacMinh';
import { CustomerDto } from './CustomerDto';
import * as fs from 'fs';
import * as converter from 'json-2-csv';
import { CSYTGetChuyenguiRequest, CSYTGetChuyenguiResponse } from './CSYT_Get_Chuyengui';
import { GetTiepdonInfoRequest, GetTiepdonInfoResponse } from './Get_Tiepdon_Info';
import { GetXetNghiemRequest, GetXetNghiemResponse } from './GetXetNghiem';
import { CommonUtils } from './CommonUtils';

var bearerToken: string = process.argv.slice(2)[0];

if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
    console.error('Bearer token is required as the first argument.');
    process.exit(1);
}
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});
const options: AxiosRequestConfig = {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': bearerToken
    },
    httpsAgent
}
const CODE_NAME_SUCCESS = 'SUCCESS';

// https://xnhiv.vn/elog-api/Data/Add_Tiepdon
export async function addTiepdon(data: AddTiepdonRequest): Promise<AddTiepdonResponse> {
    const url = 'https://xnhiv.vn/elog-api/Data/Add_Tiepdon';
    const response = await axios.post<AddTiepdonResponse>(url, data, options);
    return response.data;
}

// Request and response types for Save_XetNghiemKD

// Function to call Save_XetNghiemKD API
export async function saveXetNghiemKD(
    data: SaveXetNghiemKDRequest
): Promise<SaveXetNghiemKDResponse> {
    const url = 'https://xnhiv.vn/elog-api/Data/Save_XetNghiemKD';
    const response = await axios.post<SaveXetNghiemKDResponse>(url, data, options);
    return response.data;
}


// https://xnhiv.vn/elog-api/Data/SaveCCCD?iTiepdon_id=962312&CCCD=132095690&loai_giay_to=2&HK_Sonha=&HK_Tinh_id=0&HK_Quanhuyen_id=0&HK_Xaphuong_id=0&DC_Sonha=&DC_Tinh_id=0&DC_Quanhuyen_id=0&DC_Xaphuong_id=0
// Method GET
export async function saveCCCD(params: SaveCCCDRequest): Promise<SaveCCCDResponse> {
    const url = 'https://xnhiv.vn/elog-api/Data/SaveCCCD';
    const response = await axios.get<SaveCCCDResponse>(url, { ...options, params });
    return response.data;
}

// Request and response types for Save_Dieutri
// Function to call Save_Dieutri API
export async function saveDieutri(
    data: SaveDieutriRequest
): Promise<SaveDieutriResponse> {
    const url = 'https://xnhiv.vn/elog-api/Data/Save_Dieutri';
    const response = await axios.post<SaveDieutriResponse>(url, data, options);
    return response.data;
}

// Request and response types for Xacminh
// Function to call Xacminh API
export async function xacminh(
    data: XacminhRequest
): Promise<XacminhResponse> {
    const url = 'https://xnhiv.vn/elog-api/Data/Xacminh';
    const response = await axios.post<XacminhResponse>(url, data, options);
    return response.data;
}

// Function to call CSYT_Get_Chuyengui API
export async function csytGetChuyengui(
    params: CSYTGetChuyenguiRequest
): Promise<CSYTGetChuyenguiResponse> {
    const url = 'https://xnhiv.vn/elog-api/Data/CSYT_Get_Chuyengui';
    const response = await axios.get<CSYTGetChuyenguiResponse>(url, { ...options, params });
    return response.data;
}

// Function to call Get_Tiepdon_Info API
export async function getTiepdonInfo(
    iTiepdon_id: number
): Promise<GetTiepdonInfoResponse> {
    var params: GetTiepdonInfoRequest = {
        iTiepdon_id
    }
    const url = 'https://xnhiv.vn/elog-api/Data/Get_Tiepdon_Info';
    const response = await axios.get<GetTiepdonInfoResponse>(url, { ...options, params });
    return response.data;
}

// Function to call Get_XetNghiem API
export async function getXetNghiem(
    iTiepdon_id: number
): Promise<GetXetNghiemResponse> {
    const params: GetXetNghiemRequest = { iTiepdon_id };
    const url = 'https://xnhiv.vn/elog-api/Data/Get_XetNghiem';
    var reqOptions = options;
    reqOptions.params = params; // Ensure params are included in the request

    return axios.get<GetXetNghiemResponse>(url, reqOptions).then(res => {
        return res.data;
    }).catch(error => {
        console.error(`Error fetching XetNghiem for Tiepdon_id ${iTiepdon_id}:`, error.message);
        return {
            Code: null,
            CodeName: 'ERROR',
            ErrMessage: error.message,
            Data: null
        };
    });
}


var csytRequest: CSYTGetChuyenguiRequest = new CSYTGetChuyenguiRequest();
csytRequest.From = '2025-03-31T17:00:00.000Z';
csytRequest.To = '2025-05-29T16:59:59.614Z';
csytRequest.CSYT_Id = 524; // Replace with actual CSYT_Id
csytRequest.Tinh_id = 79; // Replace with actual Tinh_id         
csytRequest.tlvr_state = 1; // Optional, replace if needed
csytRequest.Time = 1; // Optional, replace if needed
csytRequest.iRecordOfPage = 500; // Optional, replace if needed
csytRequest.iPage = 0; // Optional, replace if needed

// Processing CSV data.
var fileContent = fs.readFileSync('./input_data.csv', 'utf8');
fileContent = fileContent.replace(/\r\n/g, '\n');
fileContent = fileContent.replace(/\r/g, '');
var danhSachKhachHang: CustomerDto[] = converter.csv2json(fileContent);

csytGetChuyengui(csytRequest).then(res => {
    var count = 0;
    res.Data.forEach(async (item) => {
        setTimeout(() => {
            var khFile = danhSachKhachHang.find(kh => kh.cmnd?.trim() == item.CCCD.trim());

            if (khFile) {
                getTiepdonInfo(item.Id || 0).then(tiepdonInfoResponse => {
                    if (tiepdonInfoResponse.CodeName === CODE_NAME_SUCCESS) {
                        var tiepDonInfo = tiepdonInfoResponse.Data;

                        // #region tạo request để call API TiepDon
                        var addTiepdonRequest: AddTiepdonRequest = new AddTiepdonRequest();
                        addTiepdonRequest = Object.assign(addTiepdonRequest, tiepDonInfo);
                        addTiepdonRequest.Id = 0;
                        addTiepdonRequest.Tiepdon_khac_id = tiepDonInfo.Id || 0;
                        addTiepdonRequest.isHanhvi_Khac = false;
                        addTiepdonRequest.isNguyco_khac = false;

                        addTiepdonRequest.Tiensu_XNDT.Ngay_XN_HIV = '';

                        addTiepdonRequest.TT_Hanhchinh.checkDC = false;

                        addTiepdonRequest.TT_Tiepdon.Da_xn = true;
                        addTiepdonRequest.TT_Tiepdon.Id = 0;
                        addTiepdonRequest.TT_Tiepdon.isBosung = false;
                        addTiepdonRequest.TT_Tiepdon.Loai_cs = 2;
                        addTiepdonRequest.TT_Tiepdon.Loai_cs_disabled = true;
                        addTiepdonRequest.TT_Tiepdon.Ma_congdong = `KC-${khFile?.maLayTest}`; // "KC-HCM-29-03-01627"
                        addTiepdonRequest.TT_Tiepdon.Ma_da = 7;
                        addTiepdonRequest.TT_Tiepdon.Ma_nv_td = "5e1cdcac-ee40-42c3-af5a-e9ae18b4d688";
                        addTiepdonRequest.TT_Tiepdon.Ma_XNSL = `CĐ-${khFile?.maVCT}`; // "CĐ-HCM-29-09270"
                        addTiepdonRequest.TT_Tiepdon.Ngay_td = CommonUtils.convertDate(khFile?.ngayXNCongDong);
                        addTiepdonRequest.TT_Tiepdon.Stt = khFile?.maVCT?.slice(-4) || '';

                        addTiepdonRequest.Tuvan_btbc = {};
                        addTiepdonRequest.TV_SXN = {};
                        addTiepdonRequest.unlocked = '';
                        addTiepdonRequest.Xac_minh = {};
                        // #endregion

                        addTiepdon(addTiepdonRequest).then(addTiepdonResponse => {
                            if (addTiepdonResponse.CodeName === CODE_NAME_SUCCESS) {
                                var tiepDonId = addTiepdonResponse.Data;
                                getXetNghiem(tiepDonId || 0).then(xetNghiemInfo => {
                                    if (xetNghiemInfo.CodeName === CODE_NAME_SUCCESS) {
                                        // #region tạo request để call API Save_XetNghiemKD
                                        var saveXetNghiemKDRequest: SaveXetNghiemKDRequest = Object.assign({}, xetNghiemInfo.Data);
                                        saveXetNghiemKDRequest.Sangloc.IsCopyCG = false;
                                        saveXetNghiemKDRequest.Sangloc.Ngaynhan_SP = '';
                                        saveXetNghiemKDRequest.Sangloc.Tiepdon_id = tiepDonId;

                                        saveXetNghiemKDRequest.Khangdinh = new Khangdinh();
                                        saveXetNghiemKDRequest.Khangdinh.Hinhthuc_xn = 2
                                        saveXetNghiemKDRequest.Khangdinh.IsChuyenGui = true
                                        saveXetNghiemKDRequest.Khangdinh.Khachhang_id = tiepDonInfo.Khachhang_id
                                        saveXetNghiemKDRequest.Khangdinh.KQ_Sangloc = 1
                                        saveXetNghiemKDRequest.Khangdinh.Ma_cs = 524
                                        saveXetNghiemKDRequest.Khangdinh.Ma_khangdinh = addTiepdonRequest.TT_Tiepdon.Ma_XNSL // "CĐ-HCM-29-09270"
                                        saveXetNghiemKDRequest.Khangdinh.nhap_tlvr_only = false
                                        saveXetNghiemKDRequest.Khangdinh.nhap_xnkd_only = false
                                        saveXetNghiemKDRequest.Khangdinh.NSP_Sangloc = 7
                                        saveXetNghiemKDRequest.Khangdinh.Tiepdon_id = tiepDonId;
                                        saveXetNghiemKDRequest.Khangdinh.TT_XN_Khangdinh = new TT_XN_Khangdinh();
                                        saveXetNghiemKDRequest.Khangdinh.TT_XN_Khangdinh.CSYT_Id = 524;
                                        saveXetNghiemKDRequest.Khangdinh.TT_XN_Khangdinh.Tinh_id = 79;
                                        saveXetNghiemKDRequest.Khangdinh.XNSL_Lai = 1
                                        saveXetNghiemKDRequest.Khangdinh.Sangloc = Object.assign({}, saveXetNghiemKDRequest.Sangloc);
                                        // #endregion

                                        saveXetNghiemKD(saveXetNghiemKDRequest).then(saveXetNghiemKDResponse => {
                                            if (saveXetNghiemKDResponse.CodeName === CODE_NAME_SUCCESS) {
                                                var saveDieutriRequest: SaveDieutriRequest = new SaveDieutriRequest();
                                                saveDieutriRequest.PrEP = new PrEP();
                                                saveDieutriRequest.PrEP.Khachhang_id = tiepDonInfo.Khachhang_id;
                                                saveDieutriRequest.PrEP.Tiepdon_id = tiepDonId;
                                                saveDieutriRequest.PrEP.Ngay_tuvan = CommonUtils.convertDate(khFile?.ngayXNCongDong);
                                                saveDieutriRequest.PrEP.Ma_nv = "5e1cdcac-ee40-42c3-af5a-e9ae18b4d688";
                                                saveDieutriRequest.PrEP.Ngay_tra_kq = CommonUtils.convertDate(khFile?.ngayXNCongDong);
                                                saveDieutriRequest.PrEP.PrEP_danhgia = 1;
                                                saveDieutriRequest.PrEP.PrEP_dieukien = 1;
                                                saveDieutriRequest.PrEP.PrEP_Dong_y = 1;
                                                saveDieutriRequest.PrEP.PrEP_Ngay_dk = CommonUtils.convertDate(khFile?.ngayXNCongDong);
                                                saveDieutriRequest.PrEP.PrEP_Ma = khFile?.maPrep || '';
                                                saveDieutriRequest.PrEP.PrEP_Coso = 'Phòng khám TESTSGN';

                                                saveDieutri(saveDieutriRequest).then(saveDieutriResponse => {
                                                    if (saveDieutriResponse.CodeName === CODE_NAME_SUCCESS) {
                                                        var xacminhRequest: XacminhRequest = new XacminhRequest();
                                                        xacminhRequest.Tiepdon_id = tiepDonId;
                                                        xacminhRequest.PrEP_dieutri_lai = 1;
                                                        xacminhRequest.PrEP_Ngay_xm = CommonUtils.convertDate(khFile?.ngayXNCongDong);
                                                        xacminhRequest.Duongtinh_cu = 0;
                                                        xacminhRequest.Trangthai_Arv = 0;
                                                        xacminhRequest.ARV_Ngay_xm = null;

                                                        xacminh(xacminhRequest).then(xacminhResponse => {
                                                            if (xacminhResponse.CodeName === CODE_NAME_SUCCESS) {
                                                                console.log(`Xac minh thành công cho khách hàng: ${khFile?.hoTen} - ${khFile?.namSinh} - ${khFile?.cmnd}`);
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        })
                                    }
                                }).catch(error => {
                                    console.error(`Lỗi khi lấy thông tin xét nghiệm cho Tiepdon_id ${tiepDonId}`);
                                });
                            } else {
                                console.error(`Lỗi khi thêm tiếp đón cho khách hàng: ${khFile?.hoTen} - ${khFile?.namSinh} - ${khFile?.cmnd}`, addTiepdonResponse.ErrMessage);
                            }
                        });
                    }
                });
            }
        }, (count++) * 1000);
    });
})

