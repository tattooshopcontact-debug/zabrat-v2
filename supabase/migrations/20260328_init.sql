-- Zabrat v2 — Schema initial
-- Toutes les tables selon le CLAUDE.md

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  level INTEGER DEFAULT 1,
  total_beers INTEGER DEFAULT 0,
  streak_current INTEGER DEFAULT 0,
  streak_max INTEGER DEFAULT 0,
  last_active DATE,
  visibility_mode TEXT DEFAULT 'friends' CHECK (visibility_mode IN ('public', 'friends', 'ghost'))
);

-- ============================================
-- TABLE: bars
-- ============================================
CREATE TABLE IF NOT EXISTS bars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  checkin_count INTEGER DEFAULT 0,
  is_partner BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: beer_logs
-- ============================================
CREATE TABLE IF NOT EXISTS beer_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  beer_type TEXT NOT NULL CHECK (beer_type IN ('blonde', 'blanche', 'brune', 'ipa', 'craft', 'autre')),
  beer_brand TEXT,
  bar_id UUID REFERENCES bars(id),
  latitude FLOAT,
  longitude FLOAT,
  note INTEGER CHECK (note BETWEEN 1 AND 5),
  photo_url TEXT,
  with_friends UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: bar_checkins
-- ============================================
CREATE TABLE IF NOT EXISTS bar_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  bar_id UUID REFERENCES bars(id) NOT NULL,
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  visibility TEXT DEFAULT 'friends' CHECK (visibility IN ('public', 'friends', 'ghost')),
  visit_count INTEGER DEFAULT 1
);

-- ============================================
-- TABLE: friendships
-- ============================================
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  friend_id UUID REFERENCES users(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- ============================================
-- TABLE: badges
-- ============================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  category TEXT CHECK (category IN ('quantity', 'exploration', 'social', 'streak', 'type', 'event', 'competition')),
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary', 'seasonal')),
  condition_type TEXT NOT NULL,
  condition_value INTEGER NOT NULL
);

-- ============================================
-- TABLE: user_badges
-- ============================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ============================================
-- TABLE: weekly_scores
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  points INTEGER DEFAULT 0,
  UNIQUE(user_id, week_start)
);

-- ============================================
-- INDEX pour performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_beer_logs_user ON beer_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_beer_logs_created ON beer_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bar_checkins_user ON bar_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_bar_checkins_bar ON bar_checkins(bar_id);
CREATE INDEX IF NOT EXISTS idx_bar_checkins_expires ON bar_checkins(expires_at);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_weekly_scores_week ON weekly_scores(week_start, points DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);

-- ============================================
-- SEED: 47 badges
-- ============================================
INSERT INTO badges (name, description, icon, category, rarity, condition_type, condition_value) VALUES
-- Quantité (8)
('Premier Verre', 'Logger sa 1ère bière', '🥤', 'quantity', 'common', 'total_beers', 1),
('L''Initié', '10 bières totales', '🔟', 'quantity', 'common', 'total_beers', 10),
('L''Amateur', '25 bières', '🍺', 'quantity', 'common', 'total_beers', 25),
('L''Assidu', '50 bières', '⭐', 'quantity', 'rare', 'total_beers', 50),
('Le Centurion', '100 bières', '💯', 'quantity', 'rare', 'total_beers', 100),
('Le Phénix', '200 bières', '🔥', 'quantity', 'epic', 'total_beers', 200),
('El Maestro', '500 bières', '💎', 'quantity', 'legendary', 'total_beers', 500),
('Le Zombie', '1000 bières', '💀', 'quantity', 'legendary', 'total_beers', 1000),
-- Exploration (6)
('Explorateur', '5 bars différents', '🗺️', 'exploration', 'common', 'unique_bars', 5),
('Nomade', '15 bars différents', '🌍', 'exploration', 'rare', 'unique_bars', 15),
('Le Pionnier', 'Premier check-in dans un nouveau bar', '🏴‍☠️', 'exploration', 'rare', 'first_checkin', 1),
('Roi de la Nuit', '3 villes différentes', '🌆', 'exploration', 'epic', 'unique_cities', 3),
('Le Cartographe', '30 bars différents', '🧭', 'exploration', 'legendary', 'unique_bars', 30),
('Le Régulier', '10 visites dans le même bar', '🏠', 'exploration', 'rare', 'same_bar_visits', 10),
-- Social (6)
('Social Starter', '3 amis ajoutés', '👥', 'social', 'common', 'friends_count', 3),
('Party Starter', 'Logger avec 3+ amis le même soir', '🎉', 'social', 'common', 'group_log', 3),
('L''Influenceur', '5 amis via invitation', '📣', 'social', 'rare', 'invited_friends', 5),
('Le Connecteur', '10 amis sur l''app', '🤝', 'social', 'epic', 'friends_count', 10),
('Le Maire', '20 amis sur l''app', '👑', 'social', 'legendary', 'friends_count', 20),
('Duo de Feu', 'Même ami, 5 soirs différents', '🔥', 'social', 'rare', 'duo_nights', 5),
-- Streak (7)
('Régulier', '3 jours de suite', '📅', 'streak', 'common', 'streak_days', 3),
('La Semaine', 'Streak 7 jours', '🔄', 'streak', 'rare', 'streak_days', 7),
('Le Mensuel', 'Streak 30 jours', '📆', 'streak', 'epic', 'streak_days', 30),
('Night Owl', 'Logger après minuit 5 fois', '🌙', 'streak', 'common', 'after_midnight', 5),
('Early Bird', 'Logger avant 18h un vendredi', '🌅', 'streak', 'rare', 'early_friday', 1),
('Nuit de Noël', 'Logger le 24 décembre', '🎄', 'streak', 'seasonal', 'christmas_eve', 1),
('Réveillon', 'Logger le 31 décembre', '🎆', 'streak', 'seasonal', 'new_years_eve', 1),
-- Types bière (6)
('IPA Lover', '10 IPAs', '🍺', 'type', 'common', 'beer_type_ipa', 10),
('Blanche Fan', '10 bières blanches', '🌾', 'type', 'common', 'beer_type_blanche', 10),
('Dark Side', '10 brunes/stouts', '🌑', 'type', 'common', 'beer_type_brune', 10),
('Craft Master', '15 craft beers', '🍾', 'type', 'rare', 'beer_type_craft', 15),
('World Explorer', 'Bières de 5 pays', '🌍', 'type', 'epic', 'beer_type_countries', 5),
('L''Épicurien', '10 types différents', '🎨', 'type', 'legendary', 'unique_beer_types', 10),
-- Événements (6)
('Marathon', '3 bars dans la même nuit', '🏃', 'event', 'rare', 'bars_same_night', 3),
('Afterwork King', 'Logger entre 17h-20h 5 fois', '🚀', 'event', 'common', 'afterwork_logs', 5),
('Nuit Blanche', 'Logger entre 2h-6h du matin', '🌙', 'event', 'epic', 'late_night_log', 1),
('Festival Goer', 'Logger lors d''un festival', '🎵', 'event', 'seasonal', 'festival_log', 1),
('Match Day', 'Logger pendant un match', '⚽', 'event', 'common', 'match_day_log', 1),
('Weekend Warrior', '10 bières uniquement le weekend', '🏆', 'event', 'rare', 'weekend_beers', 10),
-- Compétition (4)
('N°1 de la Semaine', '1er du leaderboard hebdo', '🥇', 'competition', 'rare', 'weekly_first', 1),
('Podium', 'Top 3 pendant 3 semaines', '🥈', 'competition', 'epic', 'weekly_top3', 3),
('Le Roi', 'N°1 pendant 4 semaines consécutives', '👑', 'competition', 'legendary', 'weekly_first_streak', 4),
('Le Revenant', 'Revenir top 3 après 5ème+', '📈', 'competition', 'rare', 'comeback', 1);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE beer_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bars ENABLE ROW LEVEL SECURITY;
ALTER TABLE bar_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_scores ENABLE ROW LEVEL SECURITY;

-- Policies basiques pour le MVP
-- Users: lecture publique, modification par soi-même
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Beer logs: visible par amis (simplifié: tout le monde au MVP)
CREATE POLICY "Beer logs viewable by everyone" ON beer_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert own logs" ON beer_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bars: lecture publique, création par tous
CREATE POLICY "Bars viewable by everyone" ON bars FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create bars" ON bars FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Bar checkins: lecture publique
CREATE POLICY "Checkins viewable by everyone" ON bar_checkins FOR SELECT USING (true);
CREATE POLICY "Users can insert own checkins" ON bar_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Friendships
CREATE POLICY "Users can view own friendships" ON friendships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can create friendships" ON friendships FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Badges: lecture publique
CREATE POLICY "Badges viewable by everyone" ON badges FOR SELECT USING (true);

-- User badges
CREATE POLICY "User badges viewable by everyone" ON user_badges FOR SELECT USING (true);
CREATE POLICY "System can insert badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Weekly scores
CREATE POLICY "Scores viewable by everyone" ON weekly_scores FOR SELECT USING (true);
CREATE POLICY "Users can insert own scores" ON weekly_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
