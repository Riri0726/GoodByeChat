-- ============================================
-- GoodByeChat — Supabase Schema + Seed Data
-- ============================================
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Letters table
CREATE TABLE IF NOT EXISTS public.letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  recipient_name TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  theme_color TEXT NOT NULL DEFAULT 'blue' CHECK (theme_color IN ('blue', 'purple', 'pink', 'mint', 'black')),
  music_type TEXT DEFAULT 'upload' CHECK (music_type IN ('upload', 'youtube', 'spotify')),
  music_url TEXT,
  voice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Letter images table
CREATE TABLE IF NOT EXISTS public.letter_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  letter_id UUID NOT NULL REFERENCES public.letters(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_letters_code ON public.letters(code);
CREATE INDEX IF NOT EXISTS idx_letter_images_letter_id ON public.letter_images(letter_id);

-- ============================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letter_images ENABLE ROW LEVEL SECURITY;

-- Letters: Public read by code, authenticated write
CREATE POLICY "Public can read letters by code"
  ON public.letters FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert letters"
  ON public.letters FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update letters"
  ON public.letters FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete letters"
  ON public.letters FOR DELETE
  TO authenticated
  USING (true);

-- Letter images: Public read, authenticated write
CREATE POLICY "Public can read letter images"
  ON public.letter_images FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert images"
  ON public.letter_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update images"
  ON public.letter_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete images"
  ON public.letter_images FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 3. STORAGE BUCKETS
-- ============================================
-- NOTE: Run these one at a time if you get errors.
-- You can also create buckets in the Supabase Dashboard → Storage.

INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: Public read
CREATE POLICY "Public can read audio" ON storage.objects
  FOR SELECT USING (bucket_id = 'audio');

CREATE POLICY "Public can read images" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- Storage policies: Authenticated upload
CREATE POLICY "Authenticated can upload audio" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'audio');

CREATE POLICY "Authenticated can upload images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'images');

-- Storage policies: Authenticated delete
CREATE POLICY "Authenticated can delete audio" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'audio');

CREATE POLICY "Authenticated can delete images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'images');

-- ============================================
-- 4. SEED DATA — 5 Dummy Letters (one per theme)
-- ============================================

-- BLUE THEME — Best Friend
INSERT INTO public.letters (code, recipient_name, content, theme_color, music_type, music_url, voice_url)
VALUES (
  'blue01',
  'Dear Maria, my best friend 💙',
  '<h2>To My Dearest Maria</h2>
<p>Where do I even begin? From the first day we sat beside each other in homeroom, I knew you were going to be someone special in my life. Remember when we both reached for the last seat by the window? That was the start of everything.</p>
<p>You were there through every storm — the failed exams, the heartbreaks, the days when I just wanted to give up. You always had the right words, or sometimes, the perfect silence. You understood me in ways nobody else could.</p>
<blockquote>Some people arrive in your life as blessings, and you, Maria, were the greatest one.</blockquote>
<p>I''ll never forget our lunch breaks on the rooftop, our study sessions that turned into karaoke nights, and how you always shared your food with me even when you didn''t have enough.</p>
<p>As we go our separate ways, know that no distance will ever change what we have. You are not just my best friend — you are my sister by heart. 💙</p>
<p>I love you always,<br>Your best friend forever</p>',
  'blue',
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  NULL
);

-- PURPLE THEME — Classmate (with voice)
INSERT INTO public.letters (code, recipient_name, content, theme_color, music_type, music_url, voice_url)
VALUES (
  'purp02',
  'To Kuya Josh 💜',
  '<h2>Hey Kuya Josh!</h2>
<p>I can''t believe we''re really graduating. It feels like just yesterday we were freshmen, completely lost in the hallways and accidentally walking into the wrong classroom.</p>
<p>You were always the quiet one in class, but when you spoke, everyone listened. Your ideas in group projects were always the ones that brought everything together. I admired that about you — the calm strength you carried.</p>
<p>Remember our group project in History? We stayed up until 3 AM at your house, surviving on instant noodles and energy drinks. That was terrible and amazing at the same time. 😂</p>
<blockquote>"The world is full of nice people. If you can''t find one, be one." You lived by that, Kuya.</blockquote>
<p>Thank you for being the big brother I never had. For walking me home when it was late, for defending me when others talked behind my back, and for simply being <strong>you</strong>.</p>
<p>I hope wherever life takes you, you find all the happiness you deserve. See you at the top! 🚀</p>
<p>Your forever ate,<br>With love and gratitude 💜</p>',
  'purple',
  'upload',
  NULL,
  NULL
);

-- PINK THEME — Special Someone
INSERT INTO public.letters (code, recipient_name, content, theme_color, music_type, music_url, voice_url)
VALUES (
  'pink03',
  'To You, My Almost 🩷',
  '<h2>A Letter I Should Have Written Sooner</h2>
<p>This is probably the hardest letter I''ve ever had to write. Not because I don''t know what to say, but because I have <em>so much</em> to say, and I''m afraid these words won''t be enough.</p>
<p>You were the highlight of every school day. The way you laughed, the way your eyes lit up when you talked about your dreams, the way you made everyone around you feel seen. I noticed all of it.</p>
<p>I never told you how much you meant to me. Maybe I was scared. Maybe I thought there would always be more time. But here we are, at the end of a chapter, and I need you to know:</p>
<p><strong>You made my school life beautiful.</strong></p>
<blockquote>In another life, in another time, maybe things could have been different. But in this one, I''m grateful just to have known you.</blockquote>
<p>I hope you chase every dream fearlessly. I hope you find someone who isn''t afraid to tell you how incredible you are. And I hope, years from now, when you hear our graduation song, you''ll smile and remember that someone cared about you deeply.</p>
<p>Always cheering for you,<br>The one who never got to say it 🩷</p>',
  'pink',
  'spotify',
  'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC',
  NULL
);

-- MINT GREEN THEME — Teacher
INSERT INTO public.letters (code, recipient_name, content, theme_color, music_type, music_url, voice_url)
VALUES (
  'mint04',
  'Dear Ma''am Santos, our favorite teacher 💚',
  '<h2>Thank You For Everything, Ma''am</h2>
<p>They say teachers plant seeds that grow forever. Ma''am, you didn''t just plant seeds — you built an entire garden in each of our hearts.</p>
<p>I walked into your class as a student who hated reading. I walked out as someone who carries a book everywhere. You showed me that stories are not just words on a page — they''re windows to other worlds, mirrors of ourselves.</p>
<p>You saw potential in me when I couldn''t see it myself. When I almost failed your subject in second quarter, you didn''t give up on me. You stayed after class, patiently going through every concept, never making me feel stupid for not getting it right away.</p>
<h3>Things You Taught Me Beyond the Classroom:</h3>
<ul>
<li>Kindness costs nothing but means everything</li>
<li>Hard work beats talent when talent doesn''t work hard</li>
<li>It''s okay to make mistakes — that''s how we grow</li>
<li>Always, <em>always</em> be curious</li>
</ul>
<blockquote>"Education is not the filling of a pail, but the lighting of a fire." — W.B. Yeats<br>Ma''am, you lit that fire in all of us.</blockquote>
<p>I promise to carry your lessons with me wherever I go. And when I succeed someday, I''ll come back and tell you — because a big part of it will be because of you.</p>
<p>With deepest respect and love,<br>Your grateful student forever 💚</p>',
  'mint',
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  NULL
);

-- BLACK THEME — The Whole Batch / Goodbye to Everyone
INSERT INTO public.letters (code, recipient_name, content, theme_color, music_type, music_url, voice_url)
VALUES (
  'blck05',
  'To My Batchmates — Class of 2026 🖤',
  '<h2>The Last Bell Has Rung</h2>
<p>Four years. 1,460 days. Countless memories. One family.</p>
<p>We walked into this school as strangers and we''re leaving as something much more. We are the late-night group chat warriors, the canteen line survivors, the "five more minutes" during recess crew.</p>
<p>We survived pop quizzes, clearance week, shifting class schedules, and that one semester when everything felt impossible. But we did it. <strong>Together.</strong></p>
<h3>Our Greatest Hits:</h3>
<ul>
<li>The annual school fair where Section A always brought it</li>
<li>Intramurals — win or lose, we had each other''s backs</li>
<li>The group study sessions that turned into therapy sessions</li>
<li>Every. Single. Meme. in the batch GC 😂</li>
</ul>
<blockquote>We may not all stay in touch. We may not all remember each other''s names in 10 years. But we''ll always remember how this chapter made us feel.</blockquote>
<p>To the friends who became family, the strangers who became allies, the rivals who pushed us to be better — <em>thank you</em>.</p>
<p>Go out there and be extraordinary. The world isn''t ready for what this batch is about to do. 🌟</p>
<p><strong>Class of 2026 — forever and always.</strong></p>
<p>With all my love,<br>One of your own 🖤</p>',
  'black',
  'upload',
  NULL,
  NULL
);
