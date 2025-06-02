export class SaveXetNghiemKDRequestDto {
    Sangloc?: {
        Tiepdon_id?: number
        Khachhang_id?: number
        TT_XN_Khangdinh?: {
            Tinh_id?: number
        }
        TT_Chuyengui?: object
        IsCopyCG?: boolean
    }
    Khangdinh?: {
        Tiepdon_id?: number
        Khachhang_id?: number
        Ma_cs?: number
        Ma_khangdinh?: string
        Ngay_xn?: string
        Ngay_cs_nhan_kq?: string
        KQ_Huyetthanh?: string
        KQ_PCR?: string
        XN_PCR_Bosung?: string
        KQ_PCR_BS?: string
        XN_Nhiemmoi?: string
        KQ_Nhiemmoi?: string
        KQ_TLVR?: string
        KQ_TLVR_lydo?: string
        Ngay_TLVR?: string
        Giatri_TLVR?: string
        Duonglay_HIV?: string
        Du_dk_Nhiemmoi?: string
        Hinhthuc_xn?: number
        KQ_Sangloc?: number
        NSP_Sangloc?: number
        KQ_KN_KT?: string
        Chiase?: string
        TT_XN_Khangdinh?: {
            CSYT_Id?: number
            Tinh_id?: number
        }
        XNSL_Lai?: number
        KQ_Tuthuchien?: string
        Ngaynhan_SP?: string | null
        Loaisp_khac?: string
        Loaisp_id?: string
        Hinhthuc_SP?: string
        LoaihinhXN_Id?: number
        Sudung?: number
        Du_dk_Nhiemmoi_lydo?: string
        XN_Nhiemmoi_lydo?: string
        SL_Nhiemmoi?: string
        SL_Nhiemmoi_lydo_id?: string
        nhap_tlvr_only?: boolean
        nhap_xnkd_only?: boolean
        KQ_KD_NM?: string
        IsChuyenGui?: boolean
        Sangloc?: {
            Tiepdon_id?: number
            Khachhang_id?: number
            TT_XN_Khangdinh?: {
                Tinh_id?: number
            }
            TT_Chuyengui?: object
            IsCopyCG?: boolean
        }
    }
    Type?: number
}