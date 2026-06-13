-- Visibilité par log de bière (miroir de bar_checkins.visibility)
ALTER TABLE beer_logs
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'friends'
  CHECK (visibility IN ('public', 'friends', 'ghost'));
