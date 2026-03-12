# API 스펙 (bkend.ai Service API)

Base URL: https://api-client.bkend.ai/v1
Headers: x-project-id, x-environment, Authorization: Bearer {token}

## Posts API

GET    /data/posts              - 포스트 목록 (filter, sort, page)
POST   /data/posts              - 포스트 생성 (admin)
GET    /data/posts/{id}         - 포스트 단건 조회
PATCH  /data/posts/{id}         - 포스트 수정 (admin)
DELETE /data/posts/{id}         - 포스트 삭제 (admin)

## Analytics API (Next.js Route Handlers)

POST   /api/analytics/view      - 조회수 기록 (postSlug, referrer)
GET    /api/analytics/popular   - 인기글 목록 (limit=10)
GET    /api/analytics/stats     - 전체 통계 (admin)

## Admin API (Next.js Route Handlers)

POST   /api/admin/auth/signin   - 관리자 로그인
POST   /api/admin/auth/signout  - 관리자 로그아웃
GET    /api/admin/auth/me       - 현재 관리자 정보

GET    /api/admin/keywords      - 키워드 목록
POST   /api/admin/keywords      - 키워드 생성
PATCH  /api/admin/keywords/{id} - 키워드 수정
DELETE /api/admin/keywords/{id} - 키워드 삭제

GET    /api/admin/logs          - 생성 이력 목록
POST   /api/admin/logs          - 생성 이력 기록

GET    /api/admin/dashboard     - 대시보드 통계
  Response: { totalPosts, totalViews, recentPosts, popularPosts, recentLogs }
