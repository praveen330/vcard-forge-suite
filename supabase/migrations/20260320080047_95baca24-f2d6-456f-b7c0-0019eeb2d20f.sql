ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS primary_color text DEFAULT NULL;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS secondary_color text DEFAULT NULL;