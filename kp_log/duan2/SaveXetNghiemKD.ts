export class TT_XN_Khangdinh {
    Ma_XNKD: string = '';
    Ngay_XNKD: string = '';
    Hinhthuc_xn: number | null = null;
    CSYT_Id: number | null = null;
    CSYT_Name: string = '';
    Tinh_id: number | null = null;
    KQ_Cuoicung: number | null = null;
    ARV_Info: any = null;
}

export class TT_Chuyengui {
    Sudung: number | null = null;
    LoaihinhXN_Id: number | null = null;
    Tinh_id: number | null = null;
    CSXN_Id: number | null = null;
    CSXN_Name: string = '';
    Ngay_DK: string = '';
    CS_Chuyengui: number | null = null;
    Khongsudung_lydo: string | null = '';
    File_cg: string = '';
}

export class Sangloc {
    Tiepdon_id: number | null = null;
    Khachhang_id: number | null = null;
    Hinhthuc_SP: number | null = null;
    Loaisp_id: number | null = null;
    Loaisp_khac: string = '';
    Ngaynhan_SP: string = '';
    KQ_Tuthuchien: number | null = null;
    Hinhthuc_xn: number | null = null;
    KQ_Sangloc: number | null = null;
    KQ_KN_KT: number | null = null;
    Id: number | null = null;
    DateUpdate: string | null = '';
    DateCreate: string = '';
    UserCreate: string = '';
    UserUpdate: string | null = '';
    TT_XN_Khangdinh: TT_XN_Khangdinh = new TT_XN_Khangdinh();
    TT_Chuyengui: TT_Chuyengui | null = new TT_Chuyengui();
    CSXN_da_td: boolean = false;
    IsCopyCG: boolean = false;
    ma_cs: number | null = null;
}

export class Khangdinh {
    Tiepdon_id: number | null = null;
    Khachhang_id: number | null = null;
    Ma_cs: number | null = null;
    Ma_khangdinh: string = '';
    Ngay_xn: string = '';
    Ngay_cs_nhan_kq: string = '';
    KQ_Huyetthanh: string = '';
    KQ_PCR: string = '';
    XN_PCR_Bosung: string = '';
    KQ_PCR_BS: string = '';
    XN_Nhiemmoi: string = '';
    KQ_Nhiemmoi: string = '';
    KQ_TLVR: string = '';
    KQ_TLVR_lydo: string = '';
    Ngay_TLVR: string = '';
    Giatri_TLVR: string = '';
    Duonglay_HIV: string = '';
    Du_dk_Nhiemmoi: string = '';
    Hinhthuc_xn: number | null = null;
    KQ_Sangloc: number | null = null;
    NSP_Sangloc: number | null = null;
    KQ_KN_KT: string = '';
    Chiase: string = '';
    TT_XN_Khangdinh: { CSYT_Id: number | null; Tinh_id: number | null } = { CSYT_Id: null, Tinh_id: null };
    XNSL_Lai: number | null = null;
    Du_dk_Nhiemmoi_lydo: string = '';
    XN_Nhiemmoi_lydo: string = '';
    SL_Nhiemmoi: string = '';
    SL_Nhiemmoi_lydo_id: string = '';
    nhap_tlvr_only: boolean = false;
    nhap_xnkd_only: boolean = false;
    KQ_KD_NM: string = '';
    IsChuyenGui: boolean = false;
    Sangloc: Sangloc = new Sangloc();
}

export class SaveXetNghiemKDRequest {
    Sangloc: Sangloc = new Sangloc();
    Khangdinh: Khangdinh = new Khangdinh();
    Type: number | null = null;
}

export class SaveXetNghiemKDResponse {
    Code: number | null = null;
    CodeName: string = '';
    ErrMessage: string | null = '';
    Data: number | null = null;
}
