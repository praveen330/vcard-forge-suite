
-- Fix permissive scan insert policy - require valid card_id
DROP POLICY "Anyone can insert scans" ON public.scans;
CREATE POLICY "Anyone can insert scans for active cards" ON public.scans FOR INSERT WITH CHECK (
  card_id IN (SELECT id FROM public.cards WHERE active = true)
);
