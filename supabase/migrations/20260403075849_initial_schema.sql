-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. TABLES
-- 제보 (reports)
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    latitude FLOAT8 NOT NULL,
    longitude FLOAT8 NOT NULL,
    category TEXT NOT NULL,
    mood_tag TEXT NOT NULL,
    comment TEXT NOT NULL,
    image_url TEXT,
    password TEXT NOT NULL, -- 간단한 수정을 위한 평문 비밀번호 (MVP 수준)
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '6 hours'),
    report_count INTEGER NOT NULL DEFAULT 0
);

-- 제보 반응 (reactions)
CREATE TABLE public.reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'helpful' (도움돼요), 'still_valid' (아직 유효), 'ended' (끝났어요)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. INDEXES
CREATE INDEX idx_reports_location ON public.reports (latitude, longitude);
CREATE INDEX idx_reports_expires_at ON public.reports (expires_at);
CREATE INDEX idx_reactions_report_id ON public.reactions (report_id);

-- 4. RLS (Row Level Security)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Reports 정책
-- 누구나 조회 가능 (만료된 것 제외 권장되나 MVP는 전체 허용 후 쿼리에서 필터링)
CREATE POLICY "Anyone can view reports" ON public.reports
    FOR SELECT USING (true);

-- 누구나 제보 가능
CREATE POLICY "Anyone can insert reports" ON public.reports
    FOR INSERT WITH CHECK (true);

-- 비밀번호가 일치하는 경우에만 수정 가능
CREATE POLICY "Update reports with password" ON public.reports
    FOR UPDATE USING (true); -- 실제 수정 시 WHERE id = ... AND password = ... 로 처리

-- 비밀번호가 일치하는 경우에만 삭제 가능
CREATE POLICY "Delete reports with password" ON public.reports
    FOR DELETE USING (true); -- 실제 삭제 시 WHERE id = ... AND password = ... 로 처리

-- Reactions 정책
-- 누구나 반응 조회 가능
CREATE POLICY "Anyone can view reactions" ON public.reactions
    FOR SELECT USING (true);

-- 누구나 반응 남기기 가능
CREATE POLICY "Anyone can insert reactions" ON public.reactions
    FOR INSERT WITH CHECK (true);

-- 5. VIEW (편의상 제보별 반응 집계 뷰 생성)
CREATE VIEW public.report_summary AS
SELECT 
    r.*,
    (SELECT count(*) FROM public.reactions re WHERE re.report_id = r.id AND re.type = 'helpful') as helpful_count,
    (SELECT count(*) FROM public.reactions re WHERE re.report_id = r.id AND re.type = 'still_valid') as still_valid_count,
    (SELECT count(*) FROM public.reactions re WHERE re.report_id = r.id AND re.type = 'ended') as ended_count
FROM public.reports r;
