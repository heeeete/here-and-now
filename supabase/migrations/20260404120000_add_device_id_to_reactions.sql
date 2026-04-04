-- 1. reactions 테이블에 device_id 컬럼 추가
ALTER TABLE public.reactions ADD COLUMN IF NOT EXISTS device_id TEXT;

-- 2. 기존 데이터가 있다면 적절히 처리 (MVP이므로 중복 제거 후 제약 조건 추가)
-- (실제 서비스라면 데이터를 정리해야 하지만, 현재 개발 단계이므로 중복을 허용하지 않는 방향으로 바로 진행)

-- 3. 한 기기당 한 기록에 하나의 반응만 가능하도록 유니크 제약 조건 추가
-- 기존에 중복된 데이터가 있다면 제약 조건 생성 시 에러가 날 수 있으므로, 
-- 중복된 데이터 중 최신 것만 남기고 삭제하는 로직 추가
DELETE FROM public.reactions a
USING public.reactions b
WHERE a.id < b.id
  AND a.record_id = b.record_id
  AND a.device_id = b.device_id;

ALTER TABLE public.reactions ADD CONSTRAINT unique_record_device_reaction UNIQUE (record_id, device_id);
