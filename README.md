# Sealed Letter · 봉인된 편지

사진 링크를 넣으면 밀랍으로 봉인된 고딕풍 편지 링크를 만들어 주는 서비스.
링크를 열면 봉투가 통통 튀고 있고, 누르면 봉인이 깨지며 봉투가 열리고 사진이 올라옵니다.
(색종이 파티클 + 힘 빠지는 트롬본 효과음 포함)

## 동작 방식

- DB가 없습니다. 이미지 URL을 base64url로 인코딩해 링크 경로에 그대로 담습니다: `/l/<encoded>`
- 효과음은 Web Audio API로 실시간 합성합니다(음원 파일 없음). 브라우저 자동재생 정책 때문에 봉투를 클릭하는 순간 오디오가 활성화됩니다.
- 이미지는 외부 URL을 직접 불러옵니다. 핫링크를 막는 사이트의 이미지는 보이지 않을 수 있으니, 공개된 이미지 직접 주소(우클릭 → 이미지 주소 복사)를 사용하세요.

## 로컬 실행

```bash
npm install
npm run dev     # http://localhost:3000
```

## Render 배포

### Blueprint(권장)

1. 이 폴더를 GitHub 저장소에 push
2. Render 대시보드 → **New → Blueprint** → 저장소 선택
3. 루트의 `render.yaml`이 자동으로 인식되어 웹 서비스가 생성됩니다

### 수동 설정 (New → Web Service)

| 항목 | 값 |
| --- | --- |
| Runtime | Node |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm start` |
| Environment | `NODE_VERSION=22` |

`next start`는 Render가 넣어주는 `PORT` 환경 변수를 자동으로 사용합니다. 별도 환경 변수는 필요 없습니다.

> 무료 플랜은 일정 시간 요청이 없으면 슬립 상태가 되어 첫 접속이 수십 초 걸릴 수 있습니다.

## Vercel 배포

Vercel에서 저장소를 Import하면 Next.js로 자동 인식되어 별도 설정 없이 배포됩니다.
링크 미리보기 이미지(og:image) 주소는 Vercel의 프로덕션 도메인을 자동으로 사용하며,
커스텀 도메인을 쓰면 환경 변수 `SITE_URL`(예: `https://example.com`)로 지정하세요.

## Netlify 배포

저장소의 `netlify.toml`이 빌드 설정(`npm run build`, publish `.next`)을 지정하므로 Netlify에서 저장소를 연결만 하면 됩니다.
대시보드에서 Publish directory를 `out` 등으로 바꾸면 정적 사이트로 배포되어 모든 페이지가 404가 되니 주의하세요.

## 구조

```
src/
  app/
    page.tsx, HomeForm.tsx, home.module.css   홈: 링크 입력 → 미리보기 → 봉인 링크 생성
    l/[id]/page.tsx                           링크 디코딩 (잘못된 링크는 404)
    l/[id]/Letter.tsx, letter.module.css      봉투 / 봉인 / 애니메이션
    not-found.tsx
  components/WaxSeal.tsx                      밀랍 봉인 SVG
  lib/link.ts                                 URL ↔ 링크 인코딩
  lib/confetti.ts                             캔버스 색종이 파티클
  lib/sadTrombone.ts                          "빠바바밤~" 트롬본 합성
```
