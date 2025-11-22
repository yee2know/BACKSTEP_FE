"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "../../_components/Navbar";
import { api, ApiResponse } from "../../../lib/api";

type UserDetail = {
  user_id: number;
  name: string;
  nickname: string | null;
  email: string;
  profile_image: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
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

export default function UserProfilePage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Project[]>([]);

  useEffect(() => {
    const userId = params?.userId;
    if (!userId) {
      router.replace("/profile");
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const meResponse = await api.get<
          ApiResponse<{ user: { user_id: number } }>
        >("/users/me");
        if (
          meResponse.success &&
          `${meResponse.data.user.user_id}` === userId
        ) {
          router.replace("/profile");
          return;
        }

        const response = await api.get<ApiResponse<{ user: UserDetail }>>(
          `/users/${userId}`
        );
        setUser(response.data.user);

        const postsResponse = await api.get<
          ApiResponse<{ data_total: number; projects: Project[] }>
        >(`/users/${userId}/post`);
        if (postsResponse.success) {
          setPosts(postsResponse.data.projects || []);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setError("해당 프로필 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params?.userId, router]);

  const displayName = useMemo(() => {
    if (!user) return "";
    return user.nickname?.trim() || user.name?.trim() || "Cistus User";
  }, [user]);

  const displayInitial = useMemo(() => {
    if (!user) return "U";
    return (user.nickname?.trim() || user.name?.trim() || "U").charAt(0);
  }, [user]);

  const bioText = useMemo(() => {
    if (!user?.bio) {
      return "아직 자기소개가 없습니다.";
    }
    return user.bio;
  }, [user]);

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-white text-zinc-900">
      <Navbar />

      <main className="mx-auto w-full">
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20 min-h-screen snap-start">
          {loading ? (
            <div className="flex h-96 items-center justify-center text-zinc-400">
              정보를 불러오는 중입니다...
            </div>
          ) : error ? (
            <div className="flex h-96 flex-col items-center justify-center gap-4 text-center text-zinc-500">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 hover:border-zinc-400"
              >
                이전 페이지로 돌아가기
              </button>
            </div>
          ) : user ? (
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                  <div className="mb-6 h-40 w-40 overflow-hidden rounded-full border-4 border-white shadow-xl shadow-orange-500/10">
                    {user.profile_image ? (
                      <img
                        src={user.profile_image}
                        alt={`${displayName} 프로필 이미지`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-4xl font-bold text-zinc-300">
                        {displayInitial}
                      </div>
                    )}
                  </div>

                  <div className="mb-2 flex flex-col gap-1 text-center lg:text-left">
                    <h1 className="text-3xl font-extrabold text-zinc-900">
                      {displayName}
                    </h1>
                    <p className="font-medium text-zinc-400">{user.email}</p>
                  </div>

                  <p className="mb-6 whitespace-pre-line leading-relaxed text-zinc-600">
                    {bioText}
                  </p>

                  <Link
                    href="/profile"
                    className="flex w-full items-center justify-center rounded-xl border-2 border-zinc-200 bg-white py-3 text-sm font-bold text-zinc-600 transition-all hover:border-orange-500 hover:text-orange-500"
                  >
                    내 프로필로 돌아가기
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-9">
                <div className="space-y-12">
                  <div>
                    <div className="mb-8 flex items-center justify-between">
                      <h2 className="flex items-center gap-3 text-2xl font-bold text-zinc-900">
                        <span className="h-8 w-2 rounded-full bg-orange-500"></span>
                        최근 작성한 글
                      </h2>
                    </div>

                    {posts.length > 0 ? (
                      <div className="space-y-6 max-h-[320px] overflow-y-auto pr-2 scrollbar-hide">
                        {posts.map((post) => (
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
                                  {post.failure_catagory.slice(1).map((cat) => (
                                    <span
                                      key={cat}
                                      className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500"
                                    >
                                      #{cat}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 text-zinc-400">
                        작성한 글이 없습니다.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
