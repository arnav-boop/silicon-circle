-- 1. Create Posts Table (News)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- RLS for Posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on posts" ON posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 2. Create Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tech TEXT[] DEFAULT '{}',
  author TEXT NOT NULL,
  url TEXT DEFAULT '',
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert on projects" ON projects FOR INSERT WITH CHECK (true);

-- 3. Create Hackathons Table
CREATE TABLE IF NOT EXISTS hackathons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  theme TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  url TEXT DEFAULT '',
  participants INT DEFAULT 0,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- RLS for Hackathons
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on hackathons" ON hackathons FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on hackathons" ON hackathons FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. Create Hackathon Participants Junction Table
CREATE TABLE IF NOT EXISTS hackathon_participants (
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (hackathon_id, user_id)
);

-- RLS for Hackathon Participants
ALTER TABLE hackathon_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on hackathon_participants" ON hackathon_participants FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on hackathon_participants" ON hackathon_participants FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete on hackathon_participants" ON hackathon_participants FOR DELETE USING (auth.uid() = user_id);

-- 5. Create Collab Ideas Table
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  problem TEXT NOT NULL,
  solution TEXT NOT NULL,
  sketch_url TEXT DEFAULT '',
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  upvotes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Collab Ideas
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on ideas" ON ideas FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on ideas" ON ideas FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 6. Create Collab Idea Comments Table
CREATE TABLE IF NOT EXISTS idea_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES idea_comments(id) ON DELETE CASCADE,
  upvotes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  attachment_url TEXT DEFAULT ''
);

-- RLS for Collab Idea Comments
ALTER TABLE idea_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on idea_comments" ON idea_comments FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on idea_comments" ON idea_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 7. Seed Initial Mock Data
-- Feed
INSERT INTO posts (title, content, likes, comments) VALUES
('Welcome to Silicon Circle!', 'Hey everyone! Welcome to our new tech community. This is a space for teens passionate about technology, coding, and innovation. Lets build something amazing together!', 42, 12),
('New AI Tools Released - What Do You Think?', 'The latest AI developments are incredible! From better code completion to image generation, these tools are changing how we approach programming. Share your thoughts on the latest tech!', 38, 24),
('Hackathon Season is Here!', 'Several major hackathons are coming up this season. Great opportunities to build, learn, and potentially win prizes. Check out the hackathons section to join!', 56, 18);

-- Projects
INSERT INTO projects (title, description, tech, author, url, likes) VALUES
('Discord Bot for Study Groups', 'A Discord bot that helps organize study groups with reminders, quizzes, and progress tracking.', ARRAY['Python', 'Discord.py', 'SQLite'], 'code_wizard', '', 42),
('Personal Portfolio Website', 'My portfolio site built with Next.js and Tailwind. Features dark mode and smooth animations.', ARRAY['Next.js', 'TypeScript', 'Tailwind'], 'web_dev_king', '', 38),
('AI Image Generator', 'Web app that generates images from text using stable diffusion. Has a gallery and sharing feature.', ARRAY['Python', 'FastAPI', 'React'], 'ai_enthusiast', '', 67),
('Mobile Fitness Tracker', 'Track workouts, calories, and progress with this cross-platform mobile app.', ARRAY['React Native', 'Firebase'], 'fitness_coder', '', 29),
('Browser-Based Game Engine', 'A simple 2D game engine that runs in the browser. Great for beginners learning game dev.', ARRAY['JavaScript', 'HTML5 Canvas'], 'game_creator', '', 51);

-- Hackathons
INSERT INTO hackathons (title, description, date, theme, tags, participants) VALUES
('Global Teen Hackathon 2024', 'A 48-hour hackathon for teens worldwide. Build something awesome with AI, sustainability, or education theme.', '2024-02-15', 'innovation', ARRAY['AI', 'sustainability', 'education'], 156),
('Code for Climate', 'Environmental hackathon focused on climate solutions. Create apps that help with sustainability and conservation.', '2024-03-01', 'environment', ARRAY['climate', 'sustainability', 'conservation'], 89),
('EduTech Challenge', 'Build tools to improve education accessibility. For all ages and subjects.', '2024-03-20', 'education', ARRAY['edtech', 'accessibility', 'learning'], 234);
