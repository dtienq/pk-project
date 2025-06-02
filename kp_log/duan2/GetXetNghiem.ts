export class GetXetNghiemRequest {
    iTiepdon_id: number | null = null;
}

export class GetXetNghiemResponse {
    Code: number | null = null;
    CodeName: string = '';
    ErrMessage: string | null = null;
    Data: any = null; // You can define a more specific type if needed
}