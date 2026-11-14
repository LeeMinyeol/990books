# 출처: claude-code-start

출처는 사실 확인에만 썼다. 목차, 예시, 입력값 문구는 새로 짰다. 본문 글자는 `.research/claude-code-start/`에 저장했다.

| # | 종류 | 제목 | 주소 | 확인일 | 무엇을 확인했나 |
|---|---|---|---|---|---|
| 1 | 공식 문서 | 데스크톱 앱 시작하기 | https://code.claude.com/docs/ko/desktop-quickstart | 2026-11-14 | 데스크톱 앱에 Claude Code가 들어 있어 Node.js나 CLI 설치가 필요 없다는 것, 필요한 요금제(Pro·Max·Ultra·Team·Enterprise), 설치와 로그인 순서, Code 탭 위치, 환경(Local)과 폴더 선택 순서, 권한 모드 네 가지 |
| 2 | 공식 문서 | Claude Code 데스크톱 사용 | https://code.claude.com/docs/ko/desktop | 2026-11-14 | 세션 시작 전 고르는 네 가지(환경, 폴더, 권한 모드, 모델), 권한 모드별 동작 표, 변경 사항 검토(diff 보기), 사용량 확인 위치, Code 탭 오류 문구와 해결(403, 빈 화면, Git is required) |
| 3 | 공식 문서 | 빠른 시작 (CLI) | https://code.claude.com/docs/ko/quickstart | 2026-11-14 | 터미널 방식은 별도 설치가 필요하다는 것(이 책은 다루지 않는다) |
| 4 | 공식 문서 | 고급 설정 | https://code.claude.com/docs/ko/setup | 2026-11-14 | 윈도우에서 Git for Windows는 선택 사항이라는 것 |
| 5 | 공식 문서 | 권한 모드 | https://code.claude.com/docs/ko/permission-modes | 2026-11-14 | 모드별로 묻지 않고 하는 일의 범위 |
| 6 | 공식 문서 | Claude가 프로젝트를 기억하는 방법 | https://code.claude.com/docs/ko/memory | 2026-11-14 | CLAUDE.md는 세션을 시작할 때마다 읽힌다는 것, 강제 규칙이 아니라 참고 내용으로 다뤄진다는 것, 200줄 이하 권장, /init |
| 7 | 공식 문서 | Checkpointing | https://code.claude.com/docs/ko/checkpointing | 2026-11-14 | 셸 명령으로만 바꾼 파일(이름 바꾸기, 옮기기)은 되감기로 돌아오지 않는다는 것 |
| 8 | 공식 문서 | 설치 및 로그인 문제 해결 | https://code.claude.com/docs/ko/troubleshoot-install | 2026-11-14 | 설치·로그인 오류 문구 |
| 9 | 공식 문서 | 비용 관리 | https://code.claude.com/docs/ko/costs | 2026-11-14 | 요금제 사용량이 Claude Code 사용 환경 전체에서 함께 쓰인다는 것 |
| 10 | 공식 문서 | Claude 요금제 | https://claude.com/pricing | 2026-11-14 | Pro 요금(월 결제 20달러, 연 결제 시 월 17달러꼴·200달러 선결제), Pro에 Claude Code가 포함된다는 것, 사용량이 5시간·주 단위로 계산된다는 것 |
| 11 | 공식 문서 | Claude Desktop 설치 | https://support.claude.com/ko/articles/10065433-claude-desktop-설치 | 2026-11-14 | 지원 운영체제(macOS 13 이상, Windows 10 이상), 내려받아 설치하는 순서 |
| 12 | 공식 문서 | Claude 다운로드 | https://claude.ai/download | 2026-11-14 | 데스크톱 앱 내려받는 주소 (도움말 센터의 다운로드 링크) |
| 13 | 글 | Naming Files, Paths, and Namespaces | https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file | 2026-11-14 | 윈도우 파일 이름에 쓸 수 없는 글자(< > : " / \ | ? *), 이름 끝에 공백이나 마침표를 두지 않는다는 것 |
| 14 | 글 | Excel에서 CSV UTF-8 파일을 올바르게 열기 | https://support.microsoft.com/ko-kr/excel/opening-csv-utf-8-files-correctly-in-excel | 2026-11-14 | BOM과 함께 저장한 UTF-8 CSV는 엑셀에서 바로 열리고, 그렇지 않으면 데이터 가져오기로 열어야 한다는 것 |
| 15 | 공식 문서 | 권한 구성 | https://code.claude.com/docs/ko/permissions | 2026-11-14 | 허락 창에서 "다시 묻지 않기"를 고르면 파일 수정은 세션이 끝날 때까지, 명령은 그 저장소에서 계속 적용된다는 것, 주석 없이 거절하면 그 턴이 멈춘다는 것 |

## 확인하지 못한 것
- 데스크톱 앱에서 `/rewind`(되감기)가 되는지. 공식 문서의 데스크톱 쪽에 설명이 없어서 책에서는 쓰지 않는다. 되돌리기는 연습용 복사본과 변경 기록표로 한다.
- 한국에서 결제할 때의 원화 금액과 부가세. 책에는 달러 금액과 "결제 화면 기준"이라고만 적는다.
