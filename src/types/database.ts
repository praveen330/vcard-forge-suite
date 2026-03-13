export interface Card {
  id: string;
  user_id: string;
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
