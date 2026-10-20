# to-do-list

React + Vite + TypeScript로 만든 투두리스트. 토스 느낌의 블루 톤 UI와 Pretendard 폰트를 사용하며, 데이터는 브라우저 localStorage에 저장됩니다.

## 기능

- 할 일 추가 / 완료 체크 / 수정(더블클릭 또는 ✎) / 삭제
- 우선순위(높음·보통·낮음) 지정 및 변경
- 마감일 지정 및 변경, 지난 항목·오늘 항목 강조
- 전체 / 진행중 / 완료 필터
- 등록순 / 마감일순 / 우선순위순 정렬
- 완료 항목 일괄 삭제
- 왼쪽 월간 캘린더 / 오른쪽 할 일 목록의 2단 레이아웃. 900px 이하에서는 캘린더 위, 목록 아래로 쌓임
- 캘린더에서 날짜를 누르면 그날 할 일만 보이고, 추가 시 마감일이 그 날짜로 자동 입력됨
- 다크 모드 자동 대응

## 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
npm run preview
```

## 구조

```
src/
  App.tsx                 상태 관리·필터·정렬
  types.ts                Todo, Priority, Filter 타입
  hooks/useLocalStorage.ts
  utils/date.ts           날짜 변환·마감 상태·월간 격자 생성
  components/
    TodoForm.tsx          입력 폼
    FilterBar.tsx         필터 탭·정렬·완료 삭제
    TodoList.tsx
    TodoItem.tsx          개별 항목(수정·우선순위·마감일 변경)
    Calendar.tsx          월간 캘린더
```

## 폰트 바꾸기

`index.html`의 Pretendard 링크와 `src/index.css`의 `--font-base` 값을 함께 바꾸면 됩니다.
