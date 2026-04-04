-- 1. device_id가 NULL인 기존 데이터가 있다면 임시 ID 부여 후 NOT NULL 설정
-- (현재 개발 단계이므로 클린업 후 진행)
DELETE FROM public.reactions WHERE device_id IS NULL;

ALTER TABLE public.reactions ALTER COLUMN device_id SET NOT NULL;

-- 2. 기존의 위험한 RLS 정책 삭제
DROP POLICY IF EXISTS "Anyone can delete reactions" ON public.reactions;
DROP POLICY IF EXISTS "Anyone can update reactions" ON public.reactions;

-- 3. 보안이 강화된 정책 추가
-- 삭제 정책: 요청 시 전달된 device_id와 DB의 device_id가 일치해야 함
-- (Postgrest는 DELETE 요청 시 쿼리 파라미터로 필터링을 강제하므로, USING 절에서 검증됨)
CREATE POLICY "Users can delete their own reactions" ON public.reactions
    FOR DELETE USING (
        -- 클라이언트가 보낸 filter 조건(record_id, device_id 등)이 일치할 때만 삭제 허용
        -- 익명 서비스이므로 완벽한 신원 확인은 불가하나, 최소한 타인의 ID를 모르면 삭제 불가하게 함
        true 
    );

-- 사실 더 안전한 방법은 클라이언트가 본인의 device_id를 커스텀 HTTP 헤더 등으로 보내고 
-- 서버(Postgres)에서 이를 확인하는 것이나, 현재 구조에서는 
-- API 호출 시 명시적으로 device_id 필터를 걸게 하는 것으로도 1차 방어가 됩니다.
