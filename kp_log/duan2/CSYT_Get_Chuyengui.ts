export class CSYTGetChuyenguiRequest {
    From: string = '';
    To: string = '';
    CSYT_Id: number | null = null;
    Tinh_id: number | null = null;
    Quanhuyen_id?: string = '';
    Xaphuong_id?: string = '';
    TrangThai?: string = '';
    tlvr_state?: number | null = null;
    Time?: number | null = null;
    iRecordOfPage?: number | null = null;
    iPage?: number | null = null;
    iSearchInfo?: string = '';
}

export class CSYTGetChuyenguiItem {
    Id: number | null = null;
    Hoten: string = '';
    Namsinh: number | null = null;
    Gioitinh: number | null = null;
    Solienhe: string = '';
    CCCD: string = '';
    Diachi: string | null = '';
    Ngay_td: string = '';
    Ngay_DK: string = '';
    KQ_Sangloc: number | null = null;
    Name: string = '';
}

export class CSYTGetChuyenguiResponse {
    Code: number | null = null;
    CodeName: string = '';
    ErrMessage: string | null = '';
    Data: CSYTGetChuyenguiItem[] = [];
}