export class SaveCCCDRequest {
    iTiepdon_id: number | null = null;
    CCCD: string = '';
    loai_giay_to: number | null = null;
    HK_Sonha?: string = '';
    HK_Tinh_id?: number | null = null;
    HK_Quanhuyen_id?: number | null = null;
    HK_Xaphuong_id?: number | null = null;
    DC_Sonha?: string = '';
    DC_Tinh_id?: number | null = null;
    DC_Quanhuyen_id?: number | null = null;
    DC_Xaphuong_id?: number | null = null;

    constructor(init?: Partial<SaveCCCDRequest>) {
        Object.assign(this, init);
    }
}

export class SaveCCCDResponse {
    Code: number | null = null;
    CodeName: string = '';
    ErrMessage: string | null = '';
    Data: string = '';
}
