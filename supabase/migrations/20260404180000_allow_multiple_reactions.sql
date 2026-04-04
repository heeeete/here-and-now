-- 1. 기존의 단일 반응 유니크 제약 조건 삭제
ALTER TABLE public.reactions DROP CONSTRAINT IF EXISTS unique_record_device_reaction;

-- 2. 다중 반응 허용을 위한 새로운 유니크 제약 조건 추가 (기록당 타입별로 1개씩 가능)
ALTER TABLE public.reactions ADD CONSTRAINT unique_record_device_type_reaction UNIQUE (record_id, device_id, type);
