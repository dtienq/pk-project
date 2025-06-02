export class GetTiepdonRequestDto {
    iRecordOfPage?: number;
    iPage?: number;
    sortOrder?: string;
    sortProp?: string;
    From?: string;
    To?: string;
    CSYT_Id?: number;
    Tinh_id?: number;
    Quanhuyen_id?: string;
    Xaphuong_id?: string;
    TrangThai?: string;
    tlvr_state?: number;
    Time?: number;
    iSearchInfo?: string;
}

export class GetTiepdonItemDto {
    Id?: number;
    Ngay_td?: string;
    UserCreate?: string | null;
    Nguoi_td?: string | null;
    Ngay_xnsl?: string | null;
    Ngay_xnkd?: string | null;
    KQ_XN_Sangloc?: number;
    KQ_XN_Khangdinh?: number;
    kq_xetnghiem?: number;
    KQ_TUXN?: number;
    CSXN_Sangloc?: string | null;
    CSXN_Khangdinh?: string | null;
    trang_thai?: number;
    Ngay_td_khac?: string | null;
    Ma_XNSL?: string;
    Ma_cs?: number;
    Ma_congdong?: string;
    DateCreate?: string;
    DateUpdate?: string;
    IsCG?: number | null;
    IsDT?: number;
    check_tt_sai?: number;
    check_tt_sai_note?: string | null;
    date_locked?: string | null;
    unlocked?: string | null;
    KQ_XN_TLVR?: number;
    Hoten?: string;
    Diachi?: string | null;
    Hokhau?: string | null;
    Gioitinh?: number;
    Namsinh?: number;
    Solienhe?: string;
    CCCD?: string | null;
    Nghenghiep_id?: number;
    Dantoc_id?: number;
    UID?: string | null;
    UIC?: string | null;
    Ngaysinh?: string | null;
    loai_giay_to?: number;
}

export class GetTiepdonResponseDataDto {
    CurentPage?: number;
    Data?: GetTiepdonItemDto[];
    RecordOfPage?: number;
    TotalPage?: number;
    TotalRecord?: number;
}

export class GetTiepdonResponseDto {
    Code?: number;
    CodeName?: string;
    ErrMessage?: string | null;
    Data?: GetTiepdonResponseDataDto;
}