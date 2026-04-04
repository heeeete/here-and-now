-- 제보 기본 만료 시간을 6시간에서 24시간으로 변경
ALTER TABLE public.reports 
ALTER COLUMN expires_at SET DEFAULT (now() + INTERVAL '24 hours');
