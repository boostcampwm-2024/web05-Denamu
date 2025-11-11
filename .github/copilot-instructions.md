# Denamu Project - GitHub Copilot Instructions

## 프로젝트 개요

**데나무(Denamu)** - RSS 기반 기술 블로그 큐레이션 플랫폼

개발자들이 분산된 기술 블로그 콘텐츠를 한 곳에서 편리하게 구독하고, 실시간 트렌드를 확인하며, 커뮤니티를 통해 소통할 수 있는 서비스입니다.

## 프로젝트 구조

### `/server`

- **NestJS 기반 WAS(Web Application Server)**
- TypeORM을 사용한 MySQL 데이터베이스 연동
- Redis를 활용한 캐싱 및 세션 관리
- Socket.IO 기반 실시간 채팅 기능
- JWT 인증 및 OAuth(Google, GitHub) 소셜 로그인
- Prometheus를 통한 모니터링
- Winston을 활용한 구조화된 로깅

### `/feed-crawler`

- **RSS 피드 크롤러 서비스**
- 등록된 RSS 피드를 주기적으로 수집
- AI(Anthropic Claude) 기반 콘텐츠 분석 및 태그 생성
- MySQL 데이터베이스에 수집 데이터 저장
- 의존성 주입(tsyringe) 기반 아키텍처

### `/client`

- **React + TypeScript 기반 프론트엔드**
- Vite 빌드 도구 사용
- TanStack Query를 통한 서버 상태 관리
- Zustand를 통한 클라이언트 상태 관리
- Radix UI + Tailwind CSS 기반 컴포넌트 시스템
- Socket.IO Client로 실시간 채팅 연동

### `/docker-compose`

- **인프라 구성 파일**
- 로컬 개발 환경 (docker-compose.local.yml)
- 개발 서버 환경 (docker-compose.dev.yml)
- 프로덕션 환경 (docker-compose.prod.yml)
- 인프라 서비스 (MySQL, Redis, Prometheus, Grafana)

---

## 코드 리뷰 가이드라인

### 리뷰 언어

코드 리뷰시에는 반드시 한국어를 사용하세요.

### 리뷰 우선순위 (Pn 룰 적용)

코드 리뷰 시 아래 우선순위를 반드시 명시하여 피드백을 제공하세요:

- **P1 (최우선)**: 즉각 수정이 필요한 중대한 문제 (보안 취약점, 크리티컬 버그, 비즈니스 로직 오류)
- **P2 (매우 중요)**: 반드시 반영해야 하는 코드 품질/기능 이슈
- **P3 (중요)**: 잠재적 버그 위험이나 중요한 개선 사항
- **P4 (가벼운 제안)**: 가독성/유지보수성 개선 권장 사항
- **P5 (질문 및 추천)**: 선택적 제안 및 질문

### 백엔드 코드 리뷰 중점 사항

#### 1. 보안 및 잠재 버그 위험 (P1-P2)

- **SQL Injection**: TypeORM 쿼리 빌더 사용 시 raw query 검증
- **인증/인가**: JWT 토큰 검증, refresh token 갱신 로직 확인
- **입력 검증**: class-validator DTO 검증 누락 여부
- **XSS 방지**: 사용자 입력 sanitization 확인
- **Race Condition**: Redis 동시성 제어 (락, 트랜잭션)
- **에러 핸들링**: try-catch 누락, 적절한 HTTP 상태 코드 반환
- **파일 업로드**: 파일 크기 제한, MIME 타입 검증
- **리소스 누수**: DB 커넥션, 파일 핸들러 정리 확인

#### 2. 비즈니스 로직 검증 (P1-P3)

- **데이터 일관성**: 트랜잭션 범위 적절성
- **상태 전이**: 엔티티 상태 변화 로직의 정합성
- **엣지 케이스**: 경계값, null/undefined 처리
- **중복 방지**: 조회수 증가, 좋아요 등 중복 방지 로직
- **도메인 규칙**: 비즈니스 제약 조건 준수 여부

#### 3. 성능 최적화 (P2-P4)

- **N+1 쿼리**: TypeORM relations eager loading 확인
- **인덱스 활용**: WHERE, JOIN 조건에 인덱스 사용
- **캐싱 전략**: Redis 캐시 TTL 적정성, 캐시 무효화 로직
- **페이지네이션**: offset 대신 cursor 기반 페이지네이션 고려
- **불필요한 쿼리**: 중복 DB 호출 제거
- **메모리 사용**: 대용량 데이터 스트리밍 처리

#### 4. 코드 품질 (P3-P5)

- **SOLID 원칙**: 단일 책임, 의존성 역전 준수
- **중복 제거**: DRY 원칙, 공통 로직 추출
- **명명 규칙**: 명확하고 일관된 변수/함수명
- **타입 안정성**: any 타입 남용 방지, 적절한 타입 정의
- **테스트 커버리지**: 주요 비즈니스 로직 단위 테스트

---

## 기술 스택별 권장 사항

### NestJS (Server)

- 모듈화된 구조 유지 (각 기능별 Module, Controller, Service 분리)
- Dependency Injection 적극 활용
- Global Exception Filter로 일관된 에러 응답
- Pipe를 통한 입력 검증 및 변환
- Interceptor로 로깅, 응답 변환 처리
- Guard를 통한 인증/인가 구현

### TypeScript 공통

- strict 모드 활성화 유지
- enum 대신 union type 사용 고려
- 타입 추론 활용, 불필요한 타입 명시 지양
- 유틸리티 타입 적극 활용 (Pick, Omit, Partial 등)

### React (Client)

- 컴포넌트 단일 책임 원칙 준수
- Custom Hooks로 로직 재사용
- useCallback, useMemo로 불필요한 리렌더링 방지
- TanStack Query의 staleTime, cacheTime 적절히 설정
- 접근성(a11y) 고려 (ARIA 레이블, 키보드 네비게이션)

---

## 리뷰 예시

### 좋은 리뷰 예시

```
P1) [보안] JWT 토큰 검증 시 만료 시간(exp) 체크가 누락되었습니다.
만료된 토큰으로도 인증이 통과될 수 있어 즉시 수정이 필요합니다.

P2) [성능] findAll() 메서드에서 전체 데이터를 가져온 후 필터링하고 있습니다.
WHERE 절로 DB 레벨에서 필터링하는 것이 성능상 유리합니다.

P3) [버그 가능성] Redis 캐시 조회 실패 시 에러 핸들링이 없습니다.
Redis 장애 시 서비스 전체가 중단될 수 있으니 fallback 로직을 추가하는 것이 좋겠습니다.

P4) [가독성] 중첩된 if문이 많아 로직 이해가 어렵습니다.
Early return 패턴이나 Guard clause를 활용하면 더 명확해질 것 같습니다.

P5) [제안] lodash 대신 native array 메서드를 사용하면 번들 크기를 줄일 수 있습니다.
성능 차이가 크지 않다면 고려해보시면 좋을 것 같아요.
```

---

## 주의사항

- **배포 전 체크리스트**: 환경변수 설정, 마이그레이션 실행, 테스트 통과 확인
- **로깅**: 민감 정보(비밀번호, 토큰) 로그 출력 금지
- **에러 메시지**: 프로덕션에서는 상세 에러 스택 노출 방지
- **API 버전 관리**: Breaking change 시 API 버전업 고려
- **DB 마이그레이션**: 데이터 손실 방지를 위한 롤백 계획 수립
