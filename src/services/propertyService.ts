import { PropertyListing } from '../types.ts';
import { supabase } from './supabaseClient.ts';

function toRow(p: PropertyListing, ownerId?: string | null) {
  return {
    id: p.id,
    listing_id: p.listing_id ?? null,
    slug: p.slug ?? null,
    title: p.title,
    type: p.type,
    listing_type: p.listingType,
    price: p.price,
    description: p.description,
    address: p.address,
    barangay: p.barangay ?? '',
    city: p.city,
    state: '',
    condo_name: p.condoName ?? null,
    zip_code: p.zipCode,
    beds: p.beds ?? null,
    baths: p.baths ?? null,
    sqft: p.sqft,
    lot_area: p.lotArea ?? null,
    office_space: p.officeSpace ?? null,
    warehouse_size: p.warehouseSize ?? null,
    images: p.images,
    amenities: p.amenities,
    google_maps_url: p.googleMapsUrl ?? null,
    map_embed_html: p.mapEmbedHtml ?? null,
    featured: p.featured ?? false,
    featured_until: p.featuredUntil ?? null,
    featured_image_index: p.featuredImageIndex ?? 0,
    agent: p.agent ?? 'Yhen',
    status: p.status,
    date_listed: p.dateListed,
    date_updated: p.dateUpdated ?? null,
    owner_id: ownerId !== undefined ? ownerId : undefined,
  };
}

function fromRow(row: any): PropertyListing {
  return {
    id: row.id,
    listing_id: row.listing_id ?? '000',
    slug: row.slug ?? row.id,
    title: row.title,
    type: row.type,
    listingType: row.listing_type,
    price: Number(row.price),
    description: row.description,
    address: row.address,
    barangay: row.barangay ?? '',
    city: row.city,
    condoName: row.condo_name ?? undefined,
    zipCode: row.zip_code,
    beds: row.beds ?? undefined,
    baths: row.baths ?? undefined,
    sqft: row.sqft,
    lotArea: row.lot_area ?? undefined,
    officeSpace: row.office_space ?? undefined,
    warehouseSize: row.warehouse_size ?? undefined,
    images: row.images ?? [],
    amenities: row.amenities ?? [],
    googleMapsUrl: row.google_maps_url ?? undefined,
    mapEmbedHtml: row.map_embed_html ?? undefined,
    featured: row.featured ?? false,
    featuredUntil: row.featured_until ?? undefined,
    featuredImageIndex: row.featured_image_index ?? 0,
    agent: row.agent ?? 'Yhen',
    status: row.status,
    dateListed: row.date_listed,
    dateUpdated: row.date_updated ?? undefined,
  };
}

export const PropertyService = {
  getAll: async (): Promise<PropertyListing[]> => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('date_listed', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(fromRow);
  },

  getById: async (id: string): Promise<PropertyListing | undefined> => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data) : undefined;
  },

  add: async (property: PropertyListing): Promise<PropertyListing> => {
    const { data: { user } } = await supabase.auth.getUser();
    const row = toRow(property, user?.id ?? null);
    const { data, error } = await supabase
      .from('properties')
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return fromRow(data);
  },

  update: async (id: string, property: PropertyListing): Promise<PropertyListing> => {
    const row = toRow(property);
    delete (row as any).owner_id;
    const { data, error } = await supabase
      .from('properties')
      .update(row)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return fromRow(data);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
