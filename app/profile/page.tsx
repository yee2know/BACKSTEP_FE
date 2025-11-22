"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "../_components/Navbar";
import { api } from "../../lib/api";

type UserResponse = {
  success: boolean;
  code: number;
  message: string;
  data: {
    user: {
      user_id: number;
      name: string;
      nickname: string | null;
      email: string;
      created_at: string;
      updated_at: string;
    };
  };
};

type UserDetailResponse = {
  success: boolean;
  code: number;
  message: string;
  data: {
    user: {
      user_id: number;
      name: string;
      nickname: string | null;
      email: string;
      profile_image: string | null;
      bio: string | null;
      created_at: string;
      updated_at: string;
    };
  };
};

export default function ProfilePage() {
  const [searchType, setSearchType] = useState<"post" | "profile">("post");
  const [user, setUser] = useState<UserDetailResponse["data"]["user"] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get<UserResponse>("/users/me");
        const userId = response.data.user.user_id;

        const detailResponse = await api.get<UserDetailResponse>(
          `/users/${userId}`
        );
        setUser(detailResponse.data.user);
      } catch (error) {
        console.error("Failed to fetch user info", error);
        setErrorMessage(
          "사용자 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const defaultBio = useMemo(
    () =>
      "안녕하세요! 프론트엔드 개발에 관심이 많은 개발자입니다. React와 Next.js를 주로 사용하며, 사용자 경험을 개선하는 UI 디자인에 흥미가 있습니다. 꾸준히 기록하고 성장하는 개발자가 되고 싶습니다.",
    []
  );

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-white text-zinc-900">
      {/* Navigation Bar */}
      <Navbar
        searchType={searchType}
        setSearchType={setSearchType}
      />

      <main className="mx-auto w-full">
        {/* Top Section: Profile & Recent Posts */}
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20 min-h-screen snap-start">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Left Column: User Profile Info (Fixed/Sticky on Desktop) */}
            <div className="lg:col-span-3">
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                {/* Profile Image */}
                <div className="mb-6 h-40 w-40 overflow-hidden rounded-full border-4 border-white shadow-xl shadow-orange-500/10">
                  {user?.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt="사용자 프로필 이미지"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-4xl font-bold text-zinc-300">
                      {user?.name?.charAt(0) ?? "U"}
                    </div>
                  )}
                </div>

                {/* User Identity */}
                <div className="mb-2 flex flex-col gap-1 text-center lg:text-left">
                  <h1 className="text-3xl font-extrabold text-zinc-900">
                    {isLoading ? "사용자 정보를 불러오는 중..." : user?.name ?? "Cistus User"}
                  </h1>
                  <p className="font-medium text-zinc-400">
                    {isLoading ? "loading@example.com" : user?.email ?? "user@example.com"}
                  </p>
                </div>

                {errorMessage ? (
                  <p className="mb-4 text-sm font-medium text-red-500">{errorMessage}</p>
                ) : null}

                {/* Bio */}
                <p className="mb-6 leading-relaxed text-zinc-600">
                  {user?.bio?.trim()
                    ? user.bio
                    : defaultBio}
                </p>

                {/* Edit Button */}
                <Link
                  href="/profile-edit"
                  className="mb-4 flex w-full items-center justify-center rounded-xl border-2 border-zinc-200 bg-white py-3 font-bold text-zinc-700 transition-all hover:border-orange-500 hover:text-orange-500 hover:shadow-lg hover:shadow-orange-500/10"
                >
                  프로필 편집
                </Link>

                {/* Write Post Button */}
                <Link
                  href="/post-publish"
                  className="mb-8 flex w-full items-center justify-center rounded-xl bg-orange-500 py-3 font-bold text-white transition-all hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20"
                >
                  글 쓰기
                </Link>
              </div>
            </div>

            {/* Right Column: Recent Posts List */}
            <div className="lg:col-span-9">
              <h2 className="mb-8 flex items-center gap-3 text-2xl font-bold text-zinc-900">
                <span className="h-8 w-2 rounded-full bg-orange-500"></span>
                최근 작성한 글
              </h2>

              <div className="space-y-6">
                {[
                  {
                    id: 1,
                    category: "Project Post-Mortem",
                    date: "2일 전",
                    title: "실시간 협업 툴: 웹소켓 연결 최적화 실패기",
                    desc: "동시 접속자 100명을 넘기지 못하고 서버가 다운되었던 경험. Socket.io의 룸 관리 소홀과 메모리 누수가 원인이었습니다. 부하 테스트의 중요성을 절실히 깨달았습니다.",
                    likes: 42
                  },
                  {
                    id: 2,
                    category: "Retrospective",
                    date: "5일 전",
                    title: "너무 완벽하려다 출시도 못한 투두리스트",
                    desc: "클린 아키텍처와 MSA를 무리하게 도입하려다 정작 핵심 기능 구현은 뒷전이 되었습니다. 오버엔지니어링의 폐해와 MVP(Minimum Viable Product)의 중요성에 대한 반성문.",
                    likes: 128
                  },
                  {
                    id: 3,
                    category: "Failure Analysis",
                    date: "1주 전",
                    title: "AI 기반 챗봇 서비스 중단 보고서",
                    desc: "API 비용 계산 착오로 인해 유지보수가 불가능해진 프로젝트. 비즈니스 모델 설계의 실패와 외부 의존성 관리의 위험성에 대해 분석했습니다.",
                    likes: 85
                  }
                ].map((post) => (
                  <article
                    key={post.id}
                    className="group relative flex flex-col gap-6 overflow-hidden rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md sm:flex-row"
                  >
                    <div className="aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:w-40">
                      <div className="h-full w-full bg-zinc-100 transition-colors group-hover:bg-orange-50" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between py-1">
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-orange-500">{post.category}</span>
                            <span className="text-zinc-400">• {post.date}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-medium text-zinc-500">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                            </svg>
                            <span>{post.likes}</span>
                          </div>
                        </div>
                        <h3 className="mb-2 text-lg font-bold leading-tight text-zinc-900 transition-colors group-hover:text-orange-500">
                          {post.title}
                        </h3>
                        <p className="line-clamp-2 text-sm text-zinc-500">
                          {post.desc}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-10 flex justify-center gap-2">
                <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50">
                  &lt;
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white shadow-md shadow-orange-500/20">
                  1
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-orange-500 hover:border-orange-200">
                  2
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-orange-500 hover:border-orange-200">
                  3
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50">
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Full Width Portfolio Feed */}
        <div className="w-full bg-zinc-50 border-t border-zinc-200 min-h-screen snap-start">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-12 text-center">
              <span className="mb-3 inline-block rounded-full bg-orange-100 px-4 py-1.5 text-sm font-bold text-orange-600">
                AI Generated Portfolio
              </span>
              <h2 className="text-4xl font-extrabold text-zinc-900">Portfolio Highlights</h2>
              <p className="mt-4 text-lg text-zinc-500 max-w-2xl mx-auto">
                작성된 회고록과 실패 분석 데이터를 바탕으로 AI가 자동으로 생성한 포트폴리오입니다.
                실패를 통해 얻은 구체적인 기술적 성장을 보여줍니다.
              </p>
            </div>

            <div className="grid gap-12">
              {/* Portfolio Item 1 */}
              <div className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200 transition-shadow hover:shadow-xl">
                <div className="grid md:grid-cols-2">
                  <div className="aspect-video w-full bg-zinc-100 md:aspect-auto md:h-full" />
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-4 flex gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-zinc-100 rounded-full text-xs font-bold text-zinc-600">React</span>
                      <span className="px-3 py-1 bg-zinc-100 rounded-full text-xs font-bold text-zinc-600">Redux</span>
                      <span className="px-3 py-1 bg-zinc-100 rounded-full text-xs font-bold text-zinc-600">Performance</span>
                    </div>
                    <h3 className="mb-4 text-3xl font-bold text-zinc-900">E-Commerce Dashboard Refactoring</h3>
                    <p className="mb-8 text-lg text-zinc-600 leading-relaxed">
                      "너무 완벽하려다 출시도 못한 투두리스트" 프로젝트의 실패 경험을 바탕으로,
                      과도한 엔지니어링을 배제하고 실용적인 성능 최적화에 집중했습니다.
                      기존 코드를 리팩토링하여 렌더링 성능을 40% 개선하는 성과를 거두었습니다.
                    </p>
                    <button className="w-fit font-bold text-orange-600 hover:text-orange-700 hover:underline underline-offset-4">
                      자세히 보기 &rarr;
                    </button>
                  </div>
                </div>
              </div>

              {/* Portfolio Item 2 */}
              <div className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200 transition-shadow hover:shadow-xl">
                <div className="grid md:grid-cols-2">
                  <div className="p-8 md:p-12 flex flex-col justify-center order-2 md:order-1">
                    <div className="mb-4 flex gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-zinc-100 rounded-full text-xs font-bold text-zinc-600">Socket.io</span>
                      <span className="px-3 py-1 bg-zinc-100 rounded-full text-xs font-bold text-zinc-600">Node.js</span>
                      <span className="px-3 py-1 bg-zinc-100 rounded-full text-xs font-bold text-zinc-600">System Design</span>
                    </div>
                    <h3 className="mb-4 text-3xl font-bold text-zinc-900">Real-time Collaboration Server</h3>
                    <p className="mb-8 text-lg text-zinc-600 leading-relaxed">
                      "실시간 협업 툴 실패기"에서의 교훈을 적용하여, 메모리 누수를 방지하는
                      견고한 소켓 서버 아키텍처를 재설계했습니다.
                      부하 테스트를 프로세스에 도입하여 안정성을 99.9%까지 끌어올렸습니다.
                    </p>
                    <button className="w-fit font-bold text-orange-600 hover:text-orange-700 hover:underline underline-offset-4">
                      자세히 보기 &rarr;
                    </button>
                  </div>
                  <div className="aspect-video w-full bg-zinc-100 md:aspect-auto md:h-full order-1 md:order-2" />
                </div>
              </div>
            </div>

            {/* Load More Trigger (Visual) */}
            <div className="mt-20 flex flex-col items-center justify-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500"></div>
              <p className="text-sm font-bold text-zinc-400">포트폴리오 불러오는 중...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}