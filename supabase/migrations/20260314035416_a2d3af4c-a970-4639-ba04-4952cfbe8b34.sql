
-- Organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_email TEXT NOT NULL,
  domain TEXT,
  max_cards INTEGER DEFAULT 10,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cards table
CREATE TABLE public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  job_title TEXT,
  company TEXT,
  bio TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  website TEXT,
  linkedin TEXT,
  instagram TEXT,
  twitter TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'employee',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Scans table
CREATE TABLE public.scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  source TEXT,
  device TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Promos table
CREATE TABLE public.promos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cta_text TEXT,
  cta_url TEXT,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bulk imports table
CREATE TABLE public.bulk_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  imported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total_rows INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_cards_user_id ON public.cards(user_id);
CREATE INDEX idx_cards_slug ON public.cards(slug);
CREATE INDEX idx_cards_organization_id ON public.cards(organization_id);
CREATE INDEX idx_scans_card_id ON public.scans(card_id);
CREATE INDEX idx_scans_created_at ON public.scans(created_at);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_imports ENABLE ROW LEVEL SECURITY;

-- Organizations RLS
CREATE POLICY "Superadmin can do everything on organizations" ON public.organizations FOR ALL USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'gpk330@gmail.com'
);
CREATE POLICY "Client admins can view their org" ON public.organizations FOR SELECT USING (
  owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Cards RLS
CREATE POLICY "Users can manage own cards" ON public.cards FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Public can view active cards" ON public.cards FOR SELECT USING (active = true);
CREATE POLICY "Superadmin full access cards" ON public.cards FOR ALL USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'gpk330@gmail.com'
);
CREATE POLICY "Client admin can manage org cards" ON public.cards FOR ALL USING (
  organization_id IN (
    SELECT id FROM public.organizations WHERE owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Scans RLS
CREATE POLICY "Anyone can insert scans" ON public.scans FOR INSERT WITH CHECK (true);
CREATE POLICY "Card owners can view scans" ON public.scans FOR SELECT USING (
  card_id IN (SELECT id FROM public.cards WHERE user_id = auth.uid())
);
CREATE POLICY "Superadmin can view all scans" ON public.scans FOR SELECT USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'gpk330@gmail.com'
);

-- Promos RLS
CREATE POLICY "Public can view active promos" ON public.promos FOR SELECT USING (active = true);
CREATE POLICY "Superadmin full access promos" ON public.promos FOR ALL USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'gpk330@gmail.com'
);

-- Bulk imports RLS
CREATE POLICY "Superadmin full access bulk_imports" ON public.bulk_imports FOR ALL USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'gpk330@gmail.com'
);
CREATE POLICY "Client admin can view own imports" ON public.bulk_imports FOR SELECT USING (
  organization_id IN (
    SELECT id FROM public.organizations WHERE owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);
CREATE POLICY "Client admin can insert imports" ON public.bulk_imports FOR INSERT WITH CHECK (
  organization_id IN (
    SELECT id FROM public.organizations WHERE owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Avatars storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage RLS
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Enable realtime for scans
ALTER PUBLICATION supabase_realtime ADD TABLE public.scans;
