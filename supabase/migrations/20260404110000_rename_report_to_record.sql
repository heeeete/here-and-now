-- 1. VIEW 삭제
DROP VIEW IF EXISTS public.report_summary;

-- 2. TABLE 이름 변경
ALTER TABLE public.reports RENAME TO records;

-- 3. COLUMN 이름 변경 (신고 횟수)
ALTER TABLE public.records RENAME COLUMN report_count TO complaint_count;

-- 4. REACTIONS 테이블 외래키 이름 변경
ALTER TABLE public.reactions RENAME COLUMN report_id TO record_id;

-- 5. VIEW 다시 생성 (records 기반)
CREATE VIEW public.record_summary AS
SELECT 
    r.*,
    (SELECT count(*) FROM public.reactions re WHERE re.record_id = r.id AND re.type = 'helpful') as helpful_count,
    (SELECT count(*) FROM public.reactions re WHERE re.record_id = r.id AND re.type = 'still_valid') as still_valid_count,
    (SELECT count(*) FROM public.reactions re WHERE re.record_id = r.id AND re.type = 'ended') as ended_count
FROM public.records r;

-- 6. RPC 함수 변경
DROP FUNCTION IF EXISTS public.increment_report_count(UUID);

CREATE OR REPLACE FUNCTION public.increment_record_complaint_count(record_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.records
  SET complaint_count = complaint_count + 1
  WHERE id = record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RLS 정책 이름 변경 (필수 사항은 아니나 명확성을 위해)
ALTER POLICY "Anyone can view reports" ON public.records RENAME TO "Anyone can view records";
ALTER POLICY "Anyone can insert reports" ON public.records RENAME TO "Anyone can insert records";
ALTER POLICY "Update reports with password" ON public.records RENAME TO "Update records with password";
ALTER POLICY "Delete reports with password" ON public.records RENAME TO "Delete records with password";
