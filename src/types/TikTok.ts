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

export interface FetchResult<T> {
  status: 'success' | 'error';
  result?: () => T;
  error?: string;
}

export interface ProductsResponse extends BaseAPIResponse {
  data: {
    products: {
      id: string;
      shop: { name: string };
      main_image_url: string;
      units_sold: number;
      title: string;
      sale_region: string;
      detail_link: string;
      commission: { rate: number };
      sales_price: { currency: string; minimum_amount: string; maximum_amount: string };
    }[];
    next_page_token: string;
    total_count: number;
  };
}
