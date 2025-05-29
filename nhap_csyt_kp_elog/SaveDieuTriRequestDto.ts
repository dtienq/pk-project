export class PrEP {
    Khachhang_id?: number;
    Tiepdon_id?: number;
    Ngay_tuvan?: string;
    Ma_nv?: string;
    Ngay_tra_kq?: string;
}

export class SaveDieuTriRequestDto {
    PrEP?: PrEP;
}