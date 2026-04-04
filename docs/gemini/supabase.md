# Supabase Context

## Tables & Schema

### `public.reports` (제보)
지도 위에 사용자가 남긴 실시간 현장 정보입니다. 6시간 후 자동 만료 정책을 가집니다.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | 기본키 (gen_random_uuid) |
| `created_at` | TIMESTAMPTZ | 생성 일시 |
| `latitude` | FLOAT8 | 위도 |
| `longitude` | FLOAT8 | 경도 |
| `comment` | TEXT | 한 줄 코멘트 (최대 50자) |
| `image_url` | TEXT | (선택) 첨부 이미지 URL |
| `password` | TEXT | 익명 수정/삭제를 위한 평문 비밀번호 |
| `expires_at` | TIMESTAMPTZ | 만료 예정 시각 (생성 시 +6시간) |
| `report_count` | INTEGER | 신고 누적 횟수 |

### `public.reactions` (제보 반응)
제보에 대한 사용자의 피드백입니다.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | 기본키 |
| `report_id` | UUID | 외래키 (`reports.id` 참조, CASCADE) |
| `type` | TEXT | 반응 종류 (`helpful`, `still_valid`, `ended`) |
| `created_at` | TIMESTAMPTZ | 생성 일시 |

### `public.report_summary` (View)
제보 정보와 각 반응의 카운트를 합산하여 제공하는 뷰입니다.

---

## RPC Functions

### `increment_report_count(report_id UUID)`
특정 제보의 신고 횟수(`report_count`)를 1 증가시킵니다. (SECURITY DEFINER 사용)

---

## RLS (Row Level Security)

모든 테이블에 RLS가 활성화되어 있습니다.

### `reports` 정책
- **Select**: 누구나 모든 제보를 조회할 수 있습니다. (`USING (true)`)
- **Insert**: 누구나 제보를 작성할 수 있습니다. (`WITH CHECK (true)`)
- **Update**: 누구나 요청할 수 있으나, API 레벨에서 `id`와 `password` 매칭을 통해 본인 확인을 수행합니다.
- **Delete**: 누구나 요청할 수 있으나, API 레벨에서 `id`와 `password` 매칭을 통해 본인 확인을 수행합니다.

### `reactions` 정책
- **Select**: 누구나 반응을 조회할 수 있습니다.
- **Insert**: 누구나 반응을 남길 수 있습니다.

---

## Storage
- 아직 생성된 버킷이 없습니다. (추후 이미지 업로드 기능 추가 시 생성 예정)

---

## Auth (Client)
- 현재 MVP 버전은 **비회원 익명 기반**으로 동작하며, `password` 컬럼을 통해 소유권을 확인합니다.

---

## Data Access Rules

- **Server**: 서버 전용 Supabase 클라이언트 생성 함수 `createClient()` 사용 (`@/src/shared/lib/supabase/server.ts`)
- **Client**: 직접 Supabase 접근 대신 `entities/**/api` 폴더 내의 전용 API 함수를 호출합니다.
    - 파일명 규칙: `fetch-***.ts`, `post-***.ts`, `delete-***.ts`
    - 함수당 하나의 파일 원칙 준수
