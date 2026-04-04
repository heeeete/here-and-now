-- 1. 구형 2인자 버전 함수 제거 (보안 구멍 봉쇄)
DROP FUNCTION IF EXISTS public.delete_device_reaction(UUID, TEXT);

-- 2. 최신 3인자 버전 함수는 이미 존재하므로 유지 (필요 시 명시적으로 재선언 가능)
-- (이미 20260404190000_fix_reaction_delete_logic.sql에서 생성됨)
