export interface BaseAPIResponse {
  code: number;
  message: string;
  request_id: string;
}

export interface AccessTokenResponse extends BaseAPIResponse {
  data: {
    access_token: string;
    access_token_expire_in: number;
    refresh_token: string;
    refresh_token_expire_in: number;
    open_id: string;
    seller_name: string;
    seller_base_region: string;
    user_type: number;
    granted_scopes: string[];
  };
}
