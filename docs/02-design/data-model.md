# 데이터 모델 설계 (bkend.ai)

## 테이블 구조

### 1. posts

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| title | String | required | 포스트 제목 |
| date | String | required | 발행일 YYYY-MM-DD |
| category | String | required | 운영팁/창업가이드/트렌드/사례 |
| tags | Array | - | 태그 목록 |
| description | String | required | 요약 (max 200자) |
| thumbnail | String | - | 썸네일 URL |
| draft | Boolean | default false | 초안 여부 |
| slug | String | required unique | URL 슬러그 |
| content | String | required | MDX 본문 |
| readingTime | Number | required | 읽기 시간(분) |

인덱스: slug(unique), date(desc), category
RBAC: admin=CRUD, user=Read, guest=Read(draft=false)

### 2. post_views

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| postSlug | String | required | 포스트 슬러그 |
| viewedAt | Date | required | 조회 시각 |
| referrer | String | - | 유입 경로 |
| userAgent | String | - | 브라우저 정보 |

인덱스: postSlug, viewedAt(desc)
RBAC: admin=CRUD, guest=Create

### 3. keywords

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| keyword | String | required unique | 메인 키워드 |
| subKeywords | Array | - | 연관 키워드 |
| category | String | required | 카테고리 |
| used | Boolean | default false | 사용 여부 |
| lastUsedAt | Date | - | 마지막 사용 시각 |
| priority | Number | default 0 | 우선순위 |

인덱스: keyword(unique), category, used
RBAC: admin=CRUD

### 4. generation_logs

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| keyword | String | required | 사용된 키워드 |
| postSlug | String | - | 생성된 포스트 슬러그 |
| status | String | required | success/failed/draft |
| model | String | required | AI 모델명 |
| tokensUsed | Number | - | 토큰 사용량 |
| errorMessage | String | - | 오류 메시지 |
| generatedAt | Date | required | 생성 시각 |

인덱스: generatedAt(desc), status
RBAC: admin=CRUD
