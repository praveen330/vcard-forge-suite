
-- Add new columns to cards
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS company_logo_url text;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS theme_color text DEFAULT 'dark';
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS gallery_images jsonb DEFAULT '[]'::jsonb;

-- Create card_links table
CREATE TABLE IF NOT EXISTS public.card_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text NOT NULL,
  icon text DEFAULT 'link',
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.card_links ENABLE ROW LEVEL SECURITY;

-- RLS: card owner can manage their links
CREATE POLICY "Users can manage own card links" ON public.card_links
  FOR ALL TO public
  USING (card_id IN (SELECT id FROM public.cards WHERE user_id = auth.uid()));

-- RLS: public can view active links on active cards
CREATE POLICY "Public can view active links" ON public.card_links
  FOR SELECT TO public
  USING (active = true AND card_id IN (SELECT id FROM public.cards WHERE active = true));

-- RLS: superadmin full access
CREATE POLICY "Superadmin full access card_links" ON public.card_links
  FOR ALL TO public
  USING ((SELECT email FROM auth.users WHERE id = auth.uid())::text = 'gpk330@gmail.com');

-- RLS: client admin can manage org card links
CREATE POLICY "Client admin can manage org card links" ON public.card_links
  FOR ALL TO public
  USING (card_id IN (
    SELECT c.id FROM public.cards c
    JOIN public.organizations o ON c.organization_id = o.id
    WHERE o.owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
  ));
