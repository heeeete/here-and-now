-- 1. 기존 VIEW 삭제
DROP VIEW IF EXISTS public.record_summary;

-- 2. 새로운 반응 타입을 집계하는 VIEW 생성
CREATE VIEW public.record_summary AS
SELECT 
    r.*,
    (SELECT count(*) FROM public.reactions re WHERE re.record_id = r.id AND re.type = 'like') as like_count,
    (SELECT count(*) FROM public.reactions re WHERE re.record_id = r.id AND re.type = 'amazing') as amazing_count,
    (SELECT count(*) FROM public.reactions re WHERE re.record_id = r.id AND re.type = 'funny') as funny_count,
    (SELECT count(*) FROM public.reactions re WHERE re.record_id = r.id AND re.type = 'sad') as sad_count
FROM public.records r;
