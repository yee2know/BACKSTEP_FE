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

type Project = {
  name: string;
  user: string;
  project_id: number;
  project_image: string;
  period: string;
  sale_status: string;
  is_free: string;
  helpful_count: number;
  price: number;
  failure_catagory: string[];
};

type PurchasedProject = {
  name: string;
  user: string;
  project_id: number;
  project_image: string;
  period: string;
  failure_catagory: string[];
};

type UserPostsResponse = {
  success: boolean;
  message: string;
  data: {
    data_total: number;
    projects: Project[];
  };
  code: number;
};

type UserPurchasedResponse = {
  success: boolean;
  message: string;
  data: {
    data_total: number;
    projects: PurchasedProject[];
  };
  code: number;
};

export default function ProfilePage() {
  const [searchType, setSearchType] = useState<"post" | "profile">("post");
  const [user, setUser] = useState<UserDetailResponse["data"]["user"] | null>(
    null
  );
  const [posts, setPosts] = useState<Project[]>([]);
  const [purchasedPosts, setPurchasedPosts] = useState<PurchasedProject[]>([]);
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

        const postsResponse = await api.get<UserPostsResponse>(
          `/users/${userId}/post`
        );
        if (postsResponse.success) {
          setPosts(postsResponse.data.projects);
        }

        const purchasedResponse = await api.get<UserPurchasedResponse>(
          `/users/${userId}/purchase`
        );
        if (purchasedResponse.success) {
          setPurchasedPosts(purchasedResponse.data.projects);
        }
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

  const displayName =
    user?.nickname?.trim() || user?.name?.trim() || "Cistus User";
  const displayInitial = (
    user?.nickname?.trim() ||
    user?.name?.trim() ||
    "U"
  ).charAt(0);

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-white text-zinc-900">
      {/* Navigation Bar */}
      <Navbar searchType={searchType} setSearchType={setSearchType} />

      <main className="mx-auto w-full">
        {/* Top Section: Profile & Recent Posts */}
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20 min-h-screen snap-start">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Left Column: User Profile Info (Fixed/Sticky on Desktop) */}
            <div className="lg:col-span-3">
              <div className="sticky top-24 flex flex-col items-center text-center lg:items-start lg:text-left rounded-3xl bg-zinc-50/50 p-8 border border-zinc-100">
                {/* Profile Image */}
                <div className="mb-6 h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-xl shadow-orange-500/10">
                  {user?.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt="사용자 프로필 이미지"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-4xl font-bold text-zinc-300">
                      {displayInitial}
                    </div>
                  )}
                </div>

                {/* User Identity */}
                <div className="mb-6 flex flex-col gap-1 text-center lg:text-left w-full">
                  <h1 className="text-2xl font-extrabold text-zinc-900">
                    {isLoading ? "사용자 정보를 불러오는 중..." : displayName}
                  </h1>
                  <p className="font-medium text-zinc-400 text-sm">
                    {isLoading
                      ? "loading@example.com"
                      : user?.email ?? "user@example.com"}
                  </p>
                </div>

                {errorMessage ? (
                  <p className="mb-4 text-sm font-medium text-red-500">
                    {errorMessage}
                  </p>
                ) : null}

                {/* Bio */}
                <p className="mb-8 leading-relaxed text-sm text-zinc-600 w-full">
                  {user?.bio?.trim() ? user.bio : defaultBio}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 w-full">
                  <Link
                    href="/profile-edit"
                    className="flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-white py-3 text-sm font-bold text-zinc-700 transition-all hover:border-orange-500 hover:text-orange-500 hover:shadow-lg hover:shadow-orange-500/10"
                  >
                    프로필 편집
                  </Link>

                  <Link
                    href="/post-publish"
                    className="flex w-full items-center justify-center rounded-xl bg-orange-500 py-3 text-sm font-bold text-white transition-all hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20"
                  >
                    글 쓰기
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Recent Posts & Purchased Posts */}
            <div className="lg:col-span-9 space-y-16">
              {/* Section 1: Recent Posts */}
              <div className="mb-3">
                <div className="mb-8 flex items-center justify-between">
                  <h2 className="flex items-center gap-3 text-2xl font-bold text-zinc-900">
                    <span className="h-8 w-2 rounded-full bg-orange-500"></span>
                    최근 작성한 글
                  </h2>
                </div>

                <div className="space-y-6 max-h-[320px] overflow-y-auto pr-2 scrollbar-hide">
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <Link
                        href={`/post-detail/${post.project_id}`}
                        key={post.project_id}
                        className="group relative flex flex-col gap-6 overflow-hidden rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md sm:flex-row"
                      >
                        <div className="aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:w-40">
                          {post.project_image ? (
                            <img
                              src={post.project_image}
                              alt={post.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full bg-zinc-100 transition-colors group-hover:bg-orange-50" />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col justify-between py-1">
                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="font-bold text-orange-500">
                                  {post.failure_catagory[0] || "Project"}
                                </span>
                                <span className="text-zinc-400">
                                  • {post.period}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs font-medium text-zinc-500">
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                </svg>
                                <span>{post.helpful_count}</span>
                              </div>
                            </div>
                            <h3 className="mb-2 text-lg font-bold leading-tight text-zinc-900 transition-colors group-hover:text-orange-500">
                              {post.name}
                            </h3>
                            <div className="flex flex-wrap gap-1">
                              {post.failure_catagory
                                .slice(1)
                                .map((cat, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500"
                                  >
                                    #{cat}
                                  </span>
                                ))}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 text-zinc-400">
                      작성한 글이 없습니다.
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Purchased Posts */}
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold text-zinc-900">
                    <span className="h-8 w-2 rounded-full bg-zinc-800"></span>
                    구매한 글
                  </h2>
                </div>

                <div className="space-y-6 max-h-[320px] overflow-y-auto pr-2 scrollbar-hide">
                  {purchasedPosts.length > 0 ? (
                    purchasedPosts.map((post) => (
                      <Link
                        href={`/post-detail/${post.project_id}`}
                        key={post.project_id}
                        className="group relative flex flex-col gap-6 overflow-hidden rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md sm:flex-row"
                      >
                        <div className="aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:w-40">
                          {post.project_image ? (
                            <img
                              src={post.project_image}
                              alt={post.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full bg-zinc-100 transition-colors group-hover:bg-zinc-200" />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col justify-between py-1">
                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="font-bold text-zinc-600">
                                  {post.failure_catagory[0] || "Project"}
                                </span>
                                <span className="text-zinc-400">
                                  • {post.period}
                                </span>
                              </div>
                            </div>
                            <h3 className="mb-2 text-lg font-bold leading-tight text-zinc-900 transition-colors group-hover:text-zinc-600">
                              {post.name}
                            </h3>
                            <div className="flex flex-wrap gap-1">
                              {post.failure_catagory
                                .slice(1)
                                .map((cat, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500"
                                  >
                                    #{cat}
                                  </span>
                                ))}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 text-zinc-400">
                      구매한 글이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
