-- 반응 삭제 RPC 함수 수정 (type 조건 추가)
-- 이제 record_id, device_id, type 3개가 모두 맞아야만 삭제됨
CREATE OR REPLACE FUNCTION public.delete_device_reaction(p_record_id UUID, p_device_id TEXT, p_type TEXT)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.reactions
  WHERE record_id = p_record_id 
    AND device_id = p_device_id 
    AND type = p_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
