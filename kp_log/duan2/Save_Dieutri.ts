export class PrEP {
    Khachhang_id: number | null = null;
    Tiepdon_id: number | null = null;
    Ngay_tuvan: string = '';
    Ma_nv: string = '';
    Ngay_tra_kq: string = '';
    PrEP_danhgia: number | null = null;
    PrEP_dieukien: number | null = null;
    PrEP_Dong_y: number | null = null;
    PrEP_Lydo: string = '';
    PrEP_Ngay_dk: string = '';
    PrEP_Ma: string = '';
    PrEP_Coso: string = '';
    Loai_dv: string = '';
    nPEP_Dong_y: string = '';
    nPEP_Lydo: string = '';
    nPEP_Ngay_dk: string = '';
    nPEP_Ma: string = '';
    nPEP_Coso: string = '';
    Chuyen_gui_khac: string = '';

    constructor(init?: Partial<PrEP>) {
        Object.assign(this, init);
    }
}

export class SaveDieutriRequest {
    PrEP: PrEP = new PrEP();

    constructor(init?: Partial<SaveDieutriRequest>) {
        Object.assign(this, init);
        if (init?.PrEP && !(init.PrEP instanceof PrEP)) {
            this.PrEP = new PrEP(init.PrEP);
        }
    }
}

export class SaveDieutriResponse {
    Code: number | null = null;
    CodeName: string = '';
    ErrMessage: string | null = null;
    Data: number | null = null;
}