-- ============================================================
-- SUPABASE SCHEMA FOR PORTOFOLIO
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================

-- 1. TABEL KONTEN PORTOFOLIO (Menyimpan seluruh data profil, bio, proyek, skill, timeline, rekomendasi)
CREATE TABLE IF NOT EXISTS public.portfolio_content (
  id TEXT PRIMARY KEY DEFAULT 'main',
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.portfolio_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read portfolio_content" ON public.portfolio_content;
CREATE POLICY "Public read portfolio_content"
  ON public.portfolio_content FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow all operations on portfolio_content" ON public.portfolio_content;
CREATE POLICY "Allow all operations on portfolio_content"
  ON public.portfolio_content FOR ALL
  USING (true)
  WITH CHECK (true);


-- 2. TABEL PESAN KONTAK (Menyimpan pesan dari form kontak publik)
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT false
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on contact_messages" ON public.contact_messages;
CREATE POLICY "Allow all operations on contact_messages"
  ON public.contact_messages FOR ALL
  USING (true)
  WITH CHECK (true);


-- 3. TABEL AUTENTIKASI ADMIN
CREATE TABLE IF NOT EXISTS public.admin_auth (
  id TEXT PRIMARY KEY DEFAULT 'admin',
  username TEXT NOT NULL DEFAULT 'admin',
  password_hash TEXT NOT NULL DEFAULT 'admin123',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_auth ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on admin_auth" ON public.admin_auth;
CREATE POLICY "Allow all operations on admin_auth"
  ON public.admin_auth FOR ALL
  USING (true)
  WITH CHECK (true);


-- 4. BUCKET STORAGE UNTUK UPLOAD GAMBAR
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-uploads', 'portfolio-uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access Storage" ON storage.objects;
CREATE POLICY "Public Access Storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-uploads');

DROP POLICY IF EXISTS "Allow Upload Storage" ON storage.objects;
CREATE POLICY "Allow Upload Storage"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'portfolio-uploads');

DROP POLICY IF EXISTS "Allow Update Storage" ON storage.objects;
CREATE POLICY "Allow Update Storage"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'portfolio-uploads');

DROP POLICY IF EXISTS "Allow Delete Storage" ON storage.objects;
CREATE POLICY "Allow Delete Storage"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'portfolio-uploads');
