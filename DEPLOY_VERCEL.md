# Vercel 배포 안내

1. ZIP 압축을 풀고 cliplish 폴더를 GitHub 저장소에 올립니다.
2. Vercel에서 해당 저장소를 Import합니다.
3. package.json이 있는 폴더를 Root Directory로 선택합니다.
4. Framework: Vite / Build Command: pnpm build / Output Directory: dist
5. Vercel 프로젝트 Environment Variables에 YOUTUBE_API_KEY를 추가합니다.
6. Deploy 후 /api/health와 /api/feed/today를 확인합니다.

API 키는 ZIP에 포함하지 않았습니다. VITE_ 접두어를 붙이지 마세요.
API 폴더와 server 폴더가 필요하므로 dist 폴더만 배포하지 마세요.

로컬 실행: pnpm install → .env.example을 참고하여 .env.local 생성 → pnpm dev
상세 설명: README.md

이 압축본에는 Cliplish 소스, API, 정적 자산, 설정, 테스트, Stitch 원본 및 QA 자료가 포함됩니다.
환경변수/키/백업, node_modules, 빌드 결과, 기존의 다른 프로젝트는 제외했습니다.
