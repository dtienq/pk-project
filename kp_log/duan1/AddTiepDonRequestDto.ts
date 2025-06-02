export class Diachi {
    Sonha?: string;
    Xaphuong_id?: number;
    Tinh_id?: number;
    Quanhuyen_id?: number;
    Diachi?: string;
    Ten_Xaphuong?: string | null;
}

export class TT_Hanhchinh {
    Hoten?: string;
    Gioitinh?: number;
    Namsinh?: number;
    Ngaysinh?: string;
    Solienhe?: string;
    CCCD?: string;
    loai_giay_to?: number;
    Nghenghiep_id?: number;
    Dantoc_id?: number;
    UIC?: string;
    Diachi?: Diachi;
    Hokhau?: Diachi;
    checkDC?: boolean;
}

export class Tiensu_XNDT {
    Tiensu_XN?: number;
    Ngay_XN_HIV?: string;
    Trangthai_PrEP?: string;
    Trangthai_ARV?: string;
    Chuyengui_ARV?: string;
    XN_Lai?: string;
    tx_ma_xnkd?: string;
}

export class TT_Tiepdon {
    Ngay_td?: string;
    Ma_nv_td?: string;
    Ma_cs?: number;
    Serial_cs?: string;
    Loai_cs?: number;
    Loai_cs_disabled?: boolean;
    Ma_nv_cd?: string;
    Da_xn?: boolean;
    Ma_da?: string;
    Stt?: string;
    Ma_congdong?: string;
    Ma_XNSL?: string;
    Noi_gt?: number[];
    Da_tc?: boolean;
    Nguon_kinh_phi?: number;
    isBosung?: boolean;
    Ma_SNS?: string;
}

export class AddTiepDonRequestDto {
    TT_Hanhchinh?: TT_Hanhchinh;
    Tiensu_XNDT?: Tiensu_XNDT;
    TT_Tiepdon?: TT_Tiepdon;
    DS_nguyco?: number[];
    Nguyco_khac?: string;
    DS_Hanhvi?: number[];
    Hanhvi_Khac?: string;
    Nguyco_chinh?: number;
    Tuvan_btbc?: any;
    Xac_minh?: any;
    TV_SXN?: any;
    KQ_Xetnghiem?: number;
    Khachhang_id?: number | null;
    duan_sc?: number;
    isHanhvi_Khac?: boolean;
    isNguyco_khac?: boolean;
    unlocked?: string;
}
