-- 1. 위험한 DELETE 정책 완전히 삭제 (이제 클라이언트는 직접 DELETE 불가)
DROP POLICY IF EXISTS "Users can delete their own reactions" ON public.reactions;
DROP POLICY IF EXISTS "Anyone can delete reactions" ON public.reactions;
DROP POLICY IF EXISTS "Delete records with password" ON public.reactions; -- reactions 관련 찌꺼기 제거

-- 2. 안전한 반응 삭제를 위한 RPC 함수 생성
-- SECURITY DEFINER를 사용하여 함수 내부 로직(정확한 매칭)이 RLS를 우회하여 실행되도록 함
-- 단, 호출자가 record_id와 device_id를 정확히 제공해야만 해당 행 하나만 삭제됨
CREATE OR REPLACE FUNCTION public.delete_device_reaction(p_record_id UUID, p_device_id TEXT)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.reactions
  WHERE record_id = p_record_id AND device_id = p_device_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
