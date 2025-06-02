// Request and response types for Get_Tiepdon_Info
export interface GetTiepdonInfoRequest {
    iTiepdon_id: number;
}

export interface GetTiepdonInfoResponse {
    Code: number;
    CodeName: string;
    ErrMessage: string | null;
    Data: any; // You can define a more specific type if needed
}