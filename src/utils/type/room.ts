export interface IFile {
  file_id: string;
  room_id: string;
  file_name: string;
  file_url: string;
  file_original_name: string;
  file_size: string;
  file_type: string;
}

export interface IRoom {
    id: string;
    title: string;
    content: string;
    address?: string;
    address_dtl?: string;
    price?: number | null;
    lat?: number;
    lon?: number;
    images?: IFile[];
    amenities?: string[];
    service_fee?: number | null;
    cleaning_fee?: number | null;
    max_guests?: number | null;
    reg_id?: string;
    reg_name?: string;
    reg_email?: string;
    created_at?: Date;
    updated_at?: Date;  
}
  
export interface IRoomForm{
    title: string;
    content: string;
    address?: string;
    address_dtl?: string;
    price?: number | null;
    lat?: number;
    lon?: number;
    images?: any;
  }
  