export class Diachi {
    Sonha: string = '';
    Xaphuong_id: number | null = null;
    Quanhuyen_id: number | null = null;
    Tinh_id: number | null = null;
    Diachi: string = '';
    Ten_Xaphuong: string = '';
}

export class TT_Hanhchinh {
    Hoten: string = '';
    Gioitinh: number | null = null;
    Namsinh: number | null = null;
    Ngaysinh: string = '';
    Solienhe: string = '';
    CCCD: string = '';
    loai_giay_to: number | null = null;
    Nghenghiep_id: number | null = null;
    Dantoc_id: number | null = null;
    UID: string = '';
    UIC: string = '';
    Diachi: Diachi = new Diachi();
    Hokhau: Diachi = new Diachi();
    checkDC: boolean = false;
}

export class Tiensu_XNDT {
    Tiensu_XN: number | null = null;
    Ngay_XN_HIV: string = '';
    Trangthai_PrEP: number | null = null;
    Trangthai_ARV: number | null = null;
    Chuyengui_ARV: number | null = null;
    XN_Lai: number | null = null;
    tx_ma_xnkd: string = '';
}

export class TT_Tiepdon {
    Ngay_td: string = '';
    Ma_nv_td: string = '';
    Ma_cs: number | null = null;
    Ma_cscd: number | null = null;
    Serial_cs: string = '';
    Loai_cs: number | null = null;
    Loai_cs_disabled: boolean = false;
    Ma_nv_cd: string = '';
    Da_xn: boolean = false;
    Ma_da: number | null = null;
    Stt: string = '';
    Ma_congdong: string = '';
    Ma_XNSL: string = '';
    Noi_gt: number[] = [];
    Ma_BTBC: any = null;
    Ma_SNS: string = '';
    csyt_gt: any = null;
    Website: any = null;
    Noi_gt_khac: any = null;
    Id: number | null = null;
    Da_tc: boolean = false;
    Nguon_kinh_phi: number | null = null;
    Ma_HIV_Info: any = null;
    is_txn: any = null;
    isBosung: boolean = false;
}

export class AddTiepdonRequest {
    TT_Hanhchinh: TT_Hanhchinh = new TT_Hanhchinh();
    Tiensu_XNDT: Tiensu_XNDT = new Tiensu_XNDT();
    TT_Tiepdon: TT_Tiepdon = new TT_Tiepdon();
    DS_nguyco: number[] = [];
    Nguyco_khac: string = '';
    DS_Hanhvi: number[] = [];
    Hanhvi_Khac: string = '';
    Nguyco_chinh: number | null = null;
    Tuvan_btbc: object = {};
    Xac_minh: object = {};
    TV_SXN: object = {};
    KQ_Xetnghiem: number | null = null;
    Dieutri_Arv_id: number | null = null;
    Dieutri_PrEP_id: number | null = null;
    Tiepdon_khac_id: number | null = null;
    Khachhang_id: number | null = null;
    Id: number | null = null;
    duan_sc: number | null = null;
    isHanhvi_Khac: boolean = false;
    isNguyco_khac: boolean = false;
    STI_Id: number | null = null;
    date_locked: any = null;
    unlocked: string = '';
    Ngay_td_khac: any = null;
    Ma_cscd: number | null = null;
    Ten_cscg: any = null;
    Trangthai: number | null = null;
    data_source: number | null = null;
    DateUpdate: string = '';
    DateCreate: string = '';
    UserCreate: string = '';
    UserUpdate: string = '';
}

export class AddTiepdonResponse {
    Code: number | null = null;
    CodeName: string = '';
    ErrMessage: string | null = '';
    Data: number | null = null;
}