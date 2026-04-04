# Project Context

카공하기 좋은 카페를 찾기위한 카공맵

## Architecture: FSD (Feature-Sliced Design)

- **app**: Next.js App Router (entry points, re-exports from src/app)
- **pages**: Page-level composition and layouts
- **widgets**: Complex UI blocks (e.g., Feed, PostGrid)
- **features**: User interaction logic (e.g., Like, Comment, Post creation)
- **entities**: Domain models, API logic, and shared business logic (e.g., Post, Chat, User)
- **shared**: Reusable UI (shadcn), hooks, Supabase clients, and utility functions

## Data Flow

- **Fetch**: entities/\*\*/api (Server/Client API functions)
- **Model**: entities/\*\*/model (Zod schemas, types, custom hooks)
- **UI**: shared/ui -> entities/ui -> features/ui -> widgets/ui -> pages/ui -> app
- 데이터 접근 로직은 가능한 entities/\*\*/api에 모은다
- 페이지/위젯에서는 조합과 렌더링에 집중한다
- 클라이언트 컴포넌트는 인터랙션이 필요한 최소 범위로 제한한다
