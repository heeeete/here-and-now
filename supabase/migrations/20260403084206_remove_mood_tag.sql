-- 1. VIEW 삭제
DROP VIEW IF EXISTS public.report_summary;

-- 2. COLUMN 삭제
ALTER TABLE public.reports DROP COLUMN IF EXISTS mood_tag;

-- 3. VIEW 다시 생성 (mood_tag 제외)
CREATE VIEW public.report_summary AS
SELECT 
    r.*,
    (SELECT count(*) FROM public.reactions re WHERE re.report_id = r.id AND re.type = 'helpful') as helpful_count,
    (SELECT count(*) FROM public.reactions re WHERE re.report_id = r.id AND re.type = 'still_valid') as still_valid_count,
    (SELECT count(*) FROM public.reactions re WHERE re.report_id = r.id AND re.type = 'ended') as ended_count
FROM public.reports r;
