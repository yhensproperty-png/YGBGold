
export enum PropertyType {
  Coins = 'Coins',
  Bars = 'Bars',
  Jewelry = 'Jewelry',
  Collectibles = 'Collectibles',
  ScrapGold = 'Scrap Gold',
  Others = 'Others'
}

export interface PropertyListing {
  id: string;
  listing_id: string;
  slug: string;
  title: string;
  type: PropertyType;
  listingType: 'sale';
  price: number;
  description: string;
  address: string;
  barangay: string;
  city: string;
  condoName?: string;
  zipCode: string;
  beds?: number;
  baths?: number;
  sqft: number;
  lotArea?: number;
  officeSpace?: number;
  warehouseSize?: number;
  images: string[];
  amenities: string[];
  googleMapsUrl?: string;
  mapEmbedHtml?: string;
  featured?: boolean;
  featuredUntil?: string;
  featuredImageIndex?: number;
  status: 'active' | 'draft' | 'sold' | 'archived';
  dateListed: string;
  dateUpdated?: string;
  agent?: 'Yhen' | 'Daphne' | 'Abby' | 'Juvy';
  origin?: 'Saudi Gold' | 'Japan Gold' | 'Chinese Gold' | 'Hongkong Gold';
  inventoryAmount: number;
}


export enum OrderStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Shipped = 'shipped',
  Cancelled = 'cancelled'
}

export interface Order {
  id: string;
  order_number: number;
  listing_id: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  tracking_number?: string;
  shipping_carrier?: string;
  admin_notes?: string;
  shipping_country_group?: string;
  shipping_fee?: number;
  created_at: string;
  updated_at: string;
  
  // Joined fields when querying orders with their properties
  property_title?: string;
  property_slug?: string;
  property_city?: string;
  property_image?: string;
}

export interface OrderFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_country_group: string;
  shipping_fee: number;
}
