export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_email: string;
  domain: string | null;
  max_cards: number;
  active: boolean;
  created_at: string;
}

export interface Card {
  id: string;
  user_id: string;
  organization_id: string | null;
  slug: string;
  full_name: string;
  job_title: string | null;
  company: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  linkedin: string | null;
  instagram: string | null;
  twitter: string | null;
  avatar_url: string | null;
  company_logo_url: string | null;
  theme_color: string;
  primary_color: string | null;
  secondary_color: string | null;
  gallery_images: string[];
  role: string;
  active: boolean;
  created_at: string;
}

export interface CardLink {
  id: string;
  card_id: string;
  title: string;
  url: string;
  icon: string;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface Scan {
  id: string;
  card_id: string;
  source: string | null;
  device: string | null;
  created_at: string;
}

export interface Promo {
  id: string;
  card_id: string;
  title: string;
  description: string | null;
  cta_text: string | null;
  cta_url: string | null;
  image_url: string | null;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface BulkImport {
  id: string;
  organization_id: string;
  imported_by: string | null;
  total_rows: number;
  success_count: number;
  error_count: number;
  errors: any;
  created_at: string;
}
