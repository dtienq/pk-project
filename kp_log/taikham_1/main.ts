import axios, { AxiosRequestConfig } from "axios";
import { CustomerDto } from "./CustomerDto";
// import fs from 'fs';
import * as fs from 'fs';
import * as https from 'https';
import { ThongTinKhachHangDto } from "./ThongTinKhachHangDto";
import { AddTiepDonRequestDto, TT_Hanhchinh } from "./AddTiepDonRequestDto";
import { SaveXetNghiemKDRequestDto } from "./SaveXetNghiemKDRequestDto";
import { SaveDieuTriRequestDto } from "./SaveDieuTriRequestDto";
import { writeLog } from "./slog";
import { GetTiepdonRequestDto, GetTiepdonResponseDto } from "./Get_TiepDon";
import { GetTiepdonInfoRequest, GetTiepdonInfoResponse } from "./Get_Tiepdon_Info";
const converter = require('json-2-csv');

const bearerToken = process.env['TOKEN'];

console.log(bearerToken);

if (!bearerToken || bearerToken.startsWith('Bearer ') === false) {
    console.warn('Vui lòng cung cấp token Bearer hợp lệ làm đối số khi chạy script.');
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

// step 1: Lấy họ tên, Năm sinh, Giới tính từ file CSV => danhSachKhachHang
console.log("Start running job nhap_csyt_kp_elog...");
var fileContent = fs.readFileSync('./input_data.csv', 'utf8');
fileContent = fileContent.replace(/\r\n/g, '\n');
fileContent = fileContent.replace(/\r/g, '');
var danhSachKhachHang: CustomerDto[] = converter.csv2json(fileContent);
var danhSachKhachHangConLai: CustomerDto[] = Object.assign([], danhSachKhachHang);

// #region Functions
export async function getTiepdonInfo(
    iTiepdon_id: number
): Promise<GetTiepdonInfoResponse> {
    if (iTiepdon_id == 0) {
        throw new Error("iTiepdon_id must be greater than 0");
    }

    var params: GetTiepdonInfoRequest = {
        iTiepdon_id
    }
    const url = 'https://xnhiv.vn/elog-api/Data/Get_Tiepdon_Info';
    const response = await axios.get<GetTiepdonInfoResponse>(url, { ...options, params });
    return response.data;
}

export async function getTiepdon(req: GetTiepdonRequestDto) {
    const params = { ...req };
    return axios.get<GetTiepdonResponseDto>('https://xnhiv.vn/elog-api/Data/Get_Tiepdon', {
        params,
        headers: {
            'Authorization': bearerToken,
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        httpsAgent
    }
    ).then(res => {
        return res.data;
    }).catch(err => {
        console.log(`Lỗi khi lấy danh sách tiếp đón: ${err.message}`);
        return null;
    });
}

export function getUic(fullName: string, yearOfBirth: string) {
    var nameParts = fullName.split(' ');
    var last2DigitYOB = `${yearOfBirth}`.substr(2, 2);

    if (nameParts.length == 1) return '';

    var firstName = nameParts[0];
    var lastName = nameParts[nameParts.length - 1];

    return removeVietnameseTones(`${firstName[0]}${firstName[2] || '9'}${lastName[0]}${lastName[2] || '9'}10101${last2DigitYOB}`);
}

export function removeVietnameseTones(str: string) {
    return str
        .normalize("NFD")                      // Tách ký tự và dấu
        .replace(/[\u0300-\u036f]/g, "")       // Loại bỏ dấu
        .replace(/đ/g, "d").replace(/Đ/g, "D"); // Thay đ → d, Đ → D
}

export async function layDanhSachTheoTrangThai(searchInfo: string, trang_thai: string) {
    var getTiepdonRequestDto: GetTiepdonRequestDto = new GetTiepdonRequestDto();
    // Thiết lập các tham số cho getTiepdonRequestDto
    getTiepdonRequestDto.iRecordOfPage = 50;
    getTiepdonRequestDto.iPage = 0;
    getTiepdonRequestDto.sortOrder = '';
    getTiepdonRequestDto.sortProp = '';
    getTiepdonRequestDto.From = '2025-03-15T17:00:00.000Z';
    getTiepdonRequestDto.To = '2025-06-01T16:59:59.949Z';
    getTiepdonRequestDto.CSYT_Id = 524;
    getTiepdonRequestDto.Tinh_id = 79;
    getTiepdonRequestDto.Quanhuyen_id = '';
    getTiepdonRequestDto.Xaphuong_id = '';
    getTiepdonRequestDto.TrangThai = trang_thai;
    getTiepdonRequestDto.tlvr_state = 1;
    getTiepdonRequestDto.Time = 1;
    getTiepdonRequestDto.iSearchInfo = searchInfo;

    var tiepDonRes = await getTiepdon(getTiepdonRequestDto);
    return tiepDonRes?.Data?.Data || [];
}

export async function editTiepdon(requestBody: any) {
    const url = 'https://xnhiv.vn/elog-api/Data/Edit_Tiepdon';
    try {
        const response = await axios.post<any>(url, requestBody, options);
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

export function createRequestBodyForEditTiepDon(tiepDonInfoResponse: any) {
    var Ngay_XN_HIV = new Date(tiepDonInfoResponse.TT_Tiepdon.Ngay_td);
    Ngay_XN_HIV.setMonth(Ngay_XN_HIV.getMonth() - 1);

    var result: any = Object.assign({}, tiepDonInfoResponse);
    result.isHanhvi_Khac = false;
    result.isNguyco_khac = false;
    result.Tiensu_XNDT.Chuyengui_ARV = '';
    result.Tiensu_XNDT.Ngay_XN_HIV = Ngay_XN_HIV.toISOString(); // tiepDonInfoResponse.TT_Tiepdon.Ngay_td
    result.Tiensu_XNDT.Tiensu_XN = 2;
    result.Tiensu_XNDT.Trangthai_ARV = '';
    result.Tiensu_XNDT.Trangthai_PrEP = 2;
    result.Tiensu_XNDT.XN_Lai = '';
    result.TT_Hanhchinh.checkDC = false;
    result.TT_Tiepdon.Id = tiepDonInfoResponse.Id;
    result.TT_Tiepdon.isBosung = false;
    result.Tuvan_btbc.Tiepdon_id = tiepDonInfoResponse.Id;
    result.unlocked = '';
    return result;
}

function toUTCISOString(localDateTime?: string): string {
    if (!localDateTime) {
        localDateTime = '';
    }

    return new Date(localDateTime).toISOString();
}
// #endregion

export async function main() {
    var c = 0;
    for (let i in danhSachKhachHang) {
        await setTimeout(async () => {
            var khachHang = danhSachKhachHang[i];
            var danhSachChuaHoanThanh = await layDanhSachTheoTrangThai(khachHang.fullName || '', '4'); // '1': Chưa hoàn thành, '4': Đã hoàn thành

            if (danhSachChuaHoanThanh.length == 1) {
                var khachHangTimThay = danhSachChuaHoanThanh[0];

                if (khachHangTimThay.Hoten?.toLowerCase() != khachHang.fullName?.toLowerCase() || khachHangTimThay.Namsinh != khachHang.yearOfBirth) {
                    writeLog(`Thông tin khách hàng tìm thấy không khớp: ${khachHang.fullName} - ${khachHang.yearOfBirth}`);
                }

                // if (khachHangTimThay.Hoten?.toLowerCase() == khachHang.fullName?.toLowerCase() && khachHangTimThay.Namsinh == khachHang.yearOfBirth) {
                //     var tiepDonInfoResponse = await getTiepdonInfo(danhSachChuaHoanThanh[0].Id || 0)
                //     var requestBody = createRequestBodyForEditTiepDon(tiepDonInfoResponse.Data);
                //     var editTiepdonResponse = await editTiepdon(requestBody);

                //     if (editTiepdonResponse.CodeName === 'SUCCESS') {
                //         console.log(`Đã cập nhật tiếp đón cho khách hàng: ${khachHang.fullName} - ${khachHang.yearOfBirth}`);
                //         danhSachKhachHangConLai = danhSachKhachHangConLai.filter(kh => khachHang.fullName != kh.fullName && khachHang.yearOfBirth != kh.yearOfBirth);
                //         fs.writeFileSync('./input_data.csv', converter.json2csv(danhSachKhachHangConLai), 'utf8');
                //     } else {
                //         writeLog(`Lỗi khi cập nhật tiếp đón cho khách hàng ${khachHang.fullName} - ${khachHang.yearOfBirth}: ${JSON.stringify(editTiepdonResponse)}`);
                //     }
                // } else {
                //     writeLog(`Thông tin khách hàng tìm thấy không khớp: ${khachHangTimThay.Hoten} - ${khachHangTimThay.Namsinh}`);
                // }
            } else if (danhSachChuaHoanThanh.length == 0) {
                writeLog(`Không tìm thấy tiếp đón chưa hoàn thành cho khách hàng: ${khachHang.fullName} - ${khachHang.yearOfBirth}`);
            }
        }, (c++) * 1000);
    }
}

main();