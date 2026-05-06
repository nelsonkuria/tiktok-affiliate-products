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

export type APIProduct = {
  id: string;
  shop: { name: string };
  main_image_url: string;
  title: string;
  sale_region: string;
  category_chains: { id: string; local_name: string }[];
  detail_link: string;
  units_sold: number;
  has_inventory: boolean;
  commission: { rate: number; currency: string; amount: string };
  original_price: { currency: string; minimum_amount: string; maximum_amount: string };
  sales_price: { currency: string; minimum_amount: string; maximum_amount: string };
};

export interface ProductsResponse extends BaseAPIResponse {
  data: {
    products: APIProduct[];
    next_page_token: string;
    total_count: number;
  };
}

export const eventTypes = ['products'] as const;

export type EventTypes = (typeof eventTypes)[number];
export type Event = { name: EventTypes; count: number };

export const targetTypes = ['/products'] as const;
export type TargetTypes = (typeof targetTypes)[number];
