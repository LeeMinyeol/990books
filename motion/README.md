# 움직이는 그림 (시험 중, 2026-11-15)

책 그림을 MP4로 만드는 작업 폴더다. HyperFrames(HeyGen의 오픈소스 도구, Apache 2.0)로 HTML 애니메이션을 영상으로 뽑는다.
목업이 화면 한 부분만 보여 줘서 어디인지 알기 어렵다는 의견에 따라, **앱 전체 화면 → 볼 곳 확대 → 강조와 설명** 순서로 보여 준다.

- 폴더: `motion/<slug>/<그림이름>/index.html` (HyperFrames 구성 파일)
- 필요한 것: Node 22 이상, FFmpeg
- 글꼴: `assets/fonts/`에 Pretendard woff2(Regular, Bold, ExtraBold)를 넣는다. 저장소에는 올리지 않는다.
  받는 주소: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff2/Pretendard-<굵기>.woff2`
- 확인: `npx -y hyperframes@0.9.52 check`, 장면 보기: `npx -y hyperframes@0.9.52 snapshot --at 0.5,2,5.5`
- 만들기: `npx -y hyperframes@0.9.52 render -o ../../../public/books/<slug>/<그림이름>.mp4 --crf 30 --fps 30`
- 포스터(마지막 장면): `ffmpeg -sseof -0.1 -i <그림>.mp4 -frames:v 1 -q:v 4 <그림>-poster.jpg`
- 본문에는 `![설명](/books/<slug>/<그림이름>.mp4)`로 넣는다. 뷰어가 화면에 들어올 때 한 번 재생하고 마지막 장면에서 멈춘다. 모션 줄이기 설정이면 마지막 장면만 보여 준다.
- 색과 글자 크기는 `docs/image-style.md`를 따른다. 마지막 장면이 정지 그림 규칙(글자 36px 이상, 4px 테두리, 번호표 56px)을 지켜야 한다.
