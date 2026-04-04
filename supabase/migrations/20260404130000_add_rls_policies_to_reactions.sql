-- reactions 테이블에 대한 DELETE 및 UPDATE 정책 추가
-- (기존에 SELECT, INSERT만 정의되어 있었음)

CREATE POLICY "Anyone can delete reactions" ON public.reactions
    FOR DELETE USING (true);

CREATE POLICY "Anyone can update reactions" ON public.reactions
    FOR UPDATE USING (true);
