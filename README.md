# Cistus (Backstep) - Frontend 🌿

> **X-THON 2025 Team 11**  
> 실패를 딛고 성장하는 개발자들을 위한 회고 공유 플랫폼, **Cistus**의 프론트엔드 레포지토리입니다.

## 📖 프로젝트 소개

**Cistus**는 성공 사례만 공유되는 기존의 포트폴리오 문화에서 벗어나, **실패 경험(Failure)**과 **배운 점(Lessons Learned)**을 공유하며 함께 성장하는 커뮤니티입니다.

이 레포지토리는 Cistus 서비스의 **사용자 인터페이스(UI)와 클라이언트 로직**을 담당합니다. Next.js 15와 Tailwind CSS를 기반으로 구축되었으며, Google Gemini AI를 활용한 회고 작성 보조 기능을 포함하고 있습니다.

### ✨ 프론트엔드 핵심 기능

- **🤖 AI 회고 작성 서포트 (Client-Side Integration)**

  - 사용자의 입력을 바탕으로 Google Gemini API와 연동하여 회고 초안을 생성하는 인터페이스를 제공합니다.
  - Next.js API Routes를 활용하여 API 키 보안을 유지하며 AI 서비스를 호출합니다.

- **🎨 직관적인 UX/UI**

  - **Framer Motion**을 활용한 부드러운 인터랙션과 애니메이션 (캐러셀, 카드 호버 효과 등).
  - **Tailwind CSS**를 이용한 반응형 디자인 및 일관된 스타일링.

- **🔄 데이터 인터랙션**
  - 백엔드 API와의 통신을 통해 게시글 CRUD, 좋아요, 검색, 프로필 관리 기능을 수행합니다.
  - JWT 기반의 인증 상태 관리 및 보호된 라우트 처리.

## 🛠️ 프론트엔드 기술 스택 (Tech Stack)

| 분류                | 기술                                                                                                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**       | ![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js) ![React](https://img.shields.io/badge/React_18-20232a?style=flat-square&logo=react) |
| **Language**        | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript)                                                                              |
| **Styling**         | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css)                                                                        |
| **Animation**       | ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer)                                                                            |
| **Icons**           | ![Lucide React](https://img.shields.io/badge/Lucide_React-F05032?style=flat-square&logo=lucide)                                                                              |
| **AI Integration**  | ![Google Gemini](https://img.shields.io/badge/Google_Gemini_API-8E75B2?style=flat-square&logo=google)                                                                        |
| **Package Manager** | ![npm](https://img.shields.io/badge/npm-CB3837?style=flat-square&logo=npm)                                                                                                   |

## 🚀 설치 및 실행 (Installation & Run)

이 프로젝트는 프론트엔드 전용입니다. 정상적인 서비스 이용을 위해서는 백엔드 서버가 실행 중이어야 합니다.

### 1. 저장소 클론 (Clone)

```bash
git clone https://github.com/X-THON-2025-Team11-BACKSTEP/BACKSTEP_FE.git
cd BACKSTEP_FE
```

### 2. 패키지 설치 (Install Dependencies)

```bash
npm install
# or
yarn install
```

### 3. 환경 변수 설정 (Environment Variables)

루트 디렉토리에 `.env` 파일을 생성하고 다음 변수를 설정해주세요.

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. 개발 서버 실행 (Run Dev Server)

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 확인합니다.

## 📂 폴더 구조 (Folder Structure)

```
backstep_fe/
├── app/                # Next.js App Router
│   ├── api/            # API Routes (AI Proxy 등)
│   ├── post-detail/    # 게시글 상세 페이지
│   ├── post-edit/      # 게시글 수정 페이지
│   ├── post-publish/   # 게시글 작성 페이지 (AI 기능 포함)
│   ├── profile/        # 프로필 페이지
│   ├── search/         # 검색 페이지
│   ├── page.tsx        # 메인 페이지 (홈)
│   └── layout.tsx      # 루트 레이아웃
├── lib/                # 유틸리티 함수 및 API 설정
│   ├── api.ts          # API 호출 래퍼
│   ├── gemini.ts       # Gemini AI 설정
│   └── tags.ts         # 실패 태그 데이터
├── public/             # 정적 파일 (이미지 등)
└── ...
```

## 👥 팀원 (Contributors)

- **Frontend**: [Github Profile]
- **Backend**: [Github Profile]
- **Design**: [Name]

---

© 2025 X-THON Team 11. All Rights Reserved.
