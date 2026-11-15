# 글자 규칙 (2026-11-10 확정)

## 결론
- **굵기는 3단계만 쓴다: 800, 700, 400.**
- **크기는 6단계만 쓴다: 44, 24, 19, 17, 15, 13px** (모바일에서는 큰 글자만 자동으로 줄어든다).
- 컴포넌트에서는 아래 `type-*` 클래스만 쓴다. `text-xl`, `font-bold` 같은 값을 직접 조합하지 않는다.

## 왜 3단계인가
처음 안은 굵기 6단계(900·800·700·600·500·400)였다. 조사 결과 줄였다.
- 대한민국 정부 디자인 시스템(KRDS)은 Pretendard 기반인데 굵기를 700과 400 두 가지만 쓴다. 본문 17px, 행간 150%가 기준이다.
- Figma 타이포그래피 가이드는 한 화면의 굵기를 2~3개로 제한하라고 권한다. 굵기가 많으면 무엇이 중요한지 흐려진다.
- 요즘IT의 디자인 시스템 구축 사례도 3가지 굵기로 위계 표현이 충분하다고 정리한다.
- 600과 700, 800과 900은 작은 글자에서 눈으로 구분하기 어렵다. 구분되지 않는 단계는 위계가 아니라 잡음이다.

2단계가 아니라 3단계로 둔 이유는 판매 페이지라 책 제목과 가격을 일반 제목보다 한 단계 더 세게 보여야 해서다.

출처: [KRDS 타이포그래피](https://www.krds.go.kr/html/site/style/style_03.html), [Figma: Typography in design](https://www.figma.com/resource-library/typography-in-design/), [요즘IT: 디자인 시스템 구축기 3](https://yozm.wishket.com/magazine/detail/1846/)

## 위계 표
| 클래스 | 굵기 | 크기 (PC / 모바일) | 행간 | 자간 | 쓰는 곳 |
|---|---|---|---|---|---|
| `type-display` | 800 | 44 / 30px | 1.25 | -0.02em | 대표 책 제목, 상세페이지 맨 위 제목. 한 화면에 1번 |
| `type-heading` | 800 | 24 / 22px | 1.35 | -0.015em | 구역 제목("전자책"), 로고 |
| `type-title` | 700 | 19 / 18px | 1.4 | -0.01em | 카드 제목, 가격 |
| `type-body` | 400 | 17 / 16px | 1.6 | 0 | 본문, 설명 |
| `type-small` | 400 | 15px | 1.5 | 0 | 보조 정보(소요 시간, 날짜) |
| `type-label` | 700 | 15px | 1.3 | 0 | 버튼, 메뉴, 칩 |
| `type-caption` | 700 | 13px | 1.3 | 0 | 배지("따라 하기", "준비 중") |

- 본문 안 강조는 `<strong>`(700)만 쓴다. 한 문단에 1번.
- 13px보다 작은 글자는 쓰지 않는다.
- 제목은 `text-balance`를 붙여 줄바꿈이 한쪽으로 쏠리지 않게 한다. 한글은 `word-break: keep-all`이 기본이라 단어 중간에서 끊기지 않는다.
- 색으로도 위계를 준다: 기본 `text-ink`, 보조 `text-sub`. 굵기를 늘리기 전에 색과 크기로 먼저 구분한다.

## 뷰어 슬라이드
슬라이드는 화면 크기에 따라 제목 크기가 달라서 `type-*` 대신 `font-title`(서체 + 800 고정)과 크기 클래스를 같이 쓴다. 굵기 3단계 규칙은 같다.

## 폰트 바꾸는 법
폰트는 변수 두 개로 분리돼 있다. `src/app/globals.css` 맨 위:

```css
--font-title-family: "Pretendard Variable", ...;  /* 제목: display, heading, title, font-title */
--font-body-family: "Pretendard Variable", ...;   /* 본문: body, small, label, caption */
```

제목을 Paperlogy, 본문을 Freesentation으로 바꿀 때:
1. 두 폰트 파일(woff2)을 `public/fonts/`에 넣고 `globals.css`에 `@font-face`로 등록한다. 800·700·400 세 굵기만 넣으면 된다.
2. 위 두 변수의 맨 앞에 폰트 이름을 적는다. 예: `--font-title-family: "Paperlogy", "Pretendard Variable", ...;`
3. PC와 모바일에서 대표 책 제목 줄바꿈, 버튼 글자 세로 위치를 확인한다. 폰트마다 글자 폭과 높이가 달라서 `type-display` 크기와 행간을 조금 조정해야 할 수 있다.
4. 두 폰트의 라이선스(상업 이용, 웹 임베딩)를 배포 전에 다시 확인한다.
