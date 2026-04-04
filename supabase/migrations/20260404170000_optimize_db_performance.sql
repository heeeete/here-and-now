-- 1. records 테이블에 카운트 컬럼 직접 추가 (Counter Cache)
ALTER TABLE public.records ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;
ALTER TABLE public.records ADD COLUMN IF NOT EXISTS amazing_count INTEGER DEFAULT 0;
ALTER TABLE public.records ADD COLUMN IF NOT EXISTS funny_count INTEGER DEFAULT 0;
ALTER TABLE public.records ADD COLUMN IF NOT EXISTS sad_count INTEGER DEFAULT 0;

-- 2. 기존 데이터 기반 카운트 초기화 (데이터 동기화)
UPDATE public.records r
SET 
    like_count = (SELECT count(*) FROM public.reactions re WHERE re.record_id = r.id AND re.type = 'like'),
    amazing_count = (SELECT count(*) FROM public.reactions re WHERE re.record_id = r.id AND re.type = 'amazing'),
    funny_count = (SELECT count(*) FROM public.reactions re WHERE re.record_id = r.id AND re.type = 'funny'),
    sad_count = (SELECT count(*) FROM public.reactions re WHERE re.record_id = r.id AND re.type = 'sad');

-- 3. 반응 증감 처리를 위한 트리거 함수 생성
CREATE OR REPLACE FUNCTION public.sync_reaction_count()
RETURNS TRIGGER AS $$
DECLARE
    target_column TEXT;
BEGIN
    -- 반응 타입에 따른 컬럼명 결정
    IF (TG_OP = 'INSERT') THEN
        target_column := NEW.type || '_count';
        EXECUTE format('UPDATE public.records SET %I = %I + 1 WHERE id = $1', target_column, target_column) USING NEW.record_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        target_column := OLD.type || '_count';
        EXECUTE format('UPDATE public.records SET %I = GREATEST(0, %I - 1) WHERE id = $1', target_column, target_column) USING OLD.record_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 트리거 등록
DROP TRIGGER IF EXISTS trg_sync_reaction_count ON public.reactions;
CREATE TRIGGER trg_sync_reaction_count
AFTER INSERT OR DELETE ON public.reactions
FOR EACH ROW EXECUTE FUNCTION public.sync_reaction_count();

-- 5. 인덱스 명칭 정리 및 최적화
-- 기존 인덱스 삭제 후 재생성 (명칭 변경 포함)
DROP INDEX IF EXISTS idx_reports_location;
DROP INDEX IF EXISTS idx_reports_expires_at;
DROP INDEX IF EXISTS idx_reactions_report_id;

CREATE INDEX idx_records_location ON public.records (latitude, longitude);
CREATE INDEX idx_records_expires_at ON public.records (expires_at);
CREATE INDEX idx_reactions_record_id_type ON public.reactions (record_id, type); -- 타입별 집계 최적화
CREATE INDEX idx_reactions_device_id ON public.reactions (device_id); -- 내 반응 조회 최적화

-- 6. VIEW 간소화 (서브쿼리 제거로 성능 극대화)
DROP VIEW IF EXISTS public.record_summary;
CREATE VIEW public.record_summary AS
SELECT * FROM public.records;
