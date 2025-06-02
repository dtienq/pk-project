export class PrEP {
    Khachhang_id?: number;
    Tiepdon_id?: number;
    Ngay_tuvan?: string;
    Ma_nv?: string;
    Ngay_tra_kq?: string;
    PrEP_danhgia?: number;
    PrEP_Dong_y?: number;
    PrEP_Lydo?: string;
    PrEP_Ngay_dk?: string;
    PrEP_Ma?: string;
    PrEP_Coso?: string;
    PrEP_dieukien?: number;
    Loai_dv?: string;
    nPEP_Dong_y?: string;
    nPEP_Lydo?: string;
    nPEP_Ngay_dk?: string;
    nPEP_Ma?: string;
    nPEP_Coso?: string;
    Chuyen_gui_khac?: string;
}

export class SaveDieuTriRequestDto {
    PrEP?: PrEP;
}