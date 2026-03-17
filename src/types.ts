
export enum PropertyType {
  Condo = 'Condo',
  House = 'House',
  Land = 'Land',
  Apartment = 'Apartment',
  Villa = 'Villa',
  Commercial = 'Commercial',
  Warehouse = 'Warehouse'
}

export interface PropertyListing {
  id: string;
  listing_id: string;
  slug: string;
  title: string;
  type: PropertyType;
  listingType: 'sale' | 'rent';
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
  status: 'active' | 'draft' | 'sold' | 'archived' | 'rented';
  dateListed: string;
  dateUpdated?: string;
  agent?: 'Yhen' | 'Daphne' | 'Abby' | 'Juvy';
}

export interface Commission {
  id: string;
  property_id: string;
  listing_id: string;
  property_title: string;
  sold_price: number;
  customer_agreed_percentage: number;
  yhen_percentage: number;
  taylor_percentage: number;
  daphne_percentage: number;
  abby_percentage: number;
  juvy_percentage: number;
  yhen_amount: number;
  taylor_amount: number;
  daphne_amount: number;
  abby_amount: number;
  juvy_amount: number;
  customer_paid: boolean;
  customer_payment_date: string | null;
  yhen_paid: boolean;
  yhen_payment_date: string | null;
  taylor_paid: boolean;
  taylor_payment_date: string | null;
  daphne_paid: boolean;
  daphne_payment_date: string | null;
  abby_paid: boolean;
  abby_payment_date: string | null;
  juvy_paid: boolean;
  juvy_payment_date: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CommissionFormData {
  sold_price: number;
  customer_agreed_percentage: number;
  yhen_percentage: number;
  taylor_percentage: number;
  daphne_percentage: number;
  abby_percentage: number;
  juvy_percentage: number;
  customer_paid: boolean;
  yhen_paid: boolean;
  taylor_paid: boolean;
  daphne_paid: boolean;
  abby_paid: boolean;
  juvy_paid: boolean;
}
