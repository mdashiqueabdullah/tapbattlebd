
-- Create game_settings table for storing configurable game settings
CREATE TABLE public.game_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.game_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read game settings
CREATE POLICY "Anyone can read game settings"
  ON public.game_settings FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can update
CREATE POLICY "Admins can update game settings"
  ON public.game_settings FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert game settings"
  ON public.game_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Allow anon to read too (for public pages)
CREATE POLICY "Anon can read game settings"
  ON public.game_settings FOR SELECT
  TO anon
  USING (true);

-- Insert default tap image setting
INSERT INTO public.game_settings (key, value) VALUES ('tap_character_image', '');

-- Create storage bucket for tap game images
INSERT INTO storage.buckets (id, name, public) VALUES ('tap-game-images', 'tap-game-images', true);

-- Allow admins to upload to this bucket
CREATE POLICY "Admins can upload tap game images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'tap-game-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update tap game images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'tap-game-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete tap game images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'tap-game-images' AND public.is_admin(auth.uid()));

-- Public read access for tap game images
CREATE POLICY "Public read tap game images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'tap-game-images');
