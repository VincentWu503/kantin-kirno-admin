export interface ResponseObject {
    status: number,
    data: object,
}

export interface AdminUser {
  admin_id: string;
  username: string;
  email: string;
  super_admin: boolean;
  verified: boolean;
}