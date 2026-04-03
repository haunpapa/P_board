# Frontend Improvement - Design Spec

## Overview
게시판 목록 페이지를 테이블에서 카드형 레이아웃으로 변경하고, 제목 검색 기능을 추가한다.

## Changes

### 1. Card Layout (목록 페이지)
- 테이블 -> CSS Grid 카드 레이아웃
- 카드 구성: 제목(굵게) + 날짜(회색 작게) + 수정/삭제 버튼
- 제목 클릭 시 HTML 새 탭에서 열림 (기존 동작 유지)
- hover 효과: 그림자 + translateY(-2px) 애니메이션
- 빈 상태: "게시글이 없습니다" 중앙 표시

### 2. Responsive Breakpoints
| Screen | Columns |
|--------|---------|
| PC (768px+) | 3 |
| Tablet (480~768px) | 2 |
| Mobile (~480px) | 1 |

### 3. Search
- 목록 상단에 검색 입력창 + 검색 버튼
- 제목 기준 LIKE 검색 (서버 사이드)
- 엔터 또는 버튼 클릭으로 검색 실행
- 검색 결과 없을 시 "검색 결과가 없습니다" 표시
- 검색어 초기화 버튼

### 4. Color Theme
- 기존 화이트 + 블루 계열 유지

## Files to Modify
- `views/index.ejs` — 테이블 -> 카드 그리드 + 검색 폼
- `public/style.css` — 카드 스타일 + 반응형 + 검색바
- `routes/posts.js` — 검색 쿼리 파라미터 처리
- `database.js` — 검색 쿼리 추가

## Files Unchanged
- `views/create.ejs`, `views/edit.ejs` — 기존 폼 유지
- `server.js` — 변경 없음
