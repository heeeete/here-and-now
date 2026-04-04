-- 제보 신고 수 1 증가 함수
CREATE OR REPLACE FUNCTION public.increment_report_count(report_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.reports
  SET report_count = report_count + 1
  WHERE id = report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
