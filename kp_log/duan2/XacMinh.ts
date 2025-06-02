export class XacminhRequest {
    Tiepdon_id: number | null = null;
    PrEP_dieutri_lai: number | null = null;
    PrEP_Ngay_xm: string = '';
    Duongtinh_cu: number | null = null;
    ARV_Ngay_xm: string | null = '';
    Trangthai_Arv: number | null = null;
}

export class XacminhResponse {
    Code: number | null = null;
    CodeName: string = '';
    ErrMessage: string = '';
    Data: string = '';
}