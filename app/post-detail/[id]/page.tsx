"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "../../_components/Navbar";
import {
  CalendarIcon,
  UsersIcon,
  LinkIcon,
  UserIcon,
  HeartIcon,
  QuoteIcon,
  MessageCircleIcon,
  LightbulbIcon,
  LockIcon,
  PencilIcon,
} from "lucide-react";

import { TAG_DATA } from "../../../lib/tags";
import { api, ApiResponse } from "../../../lib/api";

interface FailureData {
  tag: string;
  questions: string[];
  answers: string[];
}

interface PostData {
  title: string;
  thumbnail: string | null;
  duration: string;
  likes: number;
  author: string;
  authorId: string;
  role: string;
  teamSize: number;
  tags: string[];
  visibility: "private" | "free" | "paid";
  price: number;
  resultLink: string;
  goal: string;
  failures: FailureData[];
  lessons: string;
}

interface ApiProjectDetail {
  name: string;
  user: string;
  user_id: number;
  nickname: string;
  project_image: string;
  period: string;
  personnel: number;
  intent: string;
  my_role: string;
  sale_status: string;
  is_free: string | boolean;
  price: number;
  result_url: string;
  failure_category: string[];
  failure: Record<string, string[]>[];
  growth_point: string;
}

export default function PostDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get<ApiResponse<{ user: { user_id: number } }>>(
          "/users/me"
        );
        if (response.success) {
          setCurrentUserId(String(response.data.user.user_id));
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const response = await api.get<ApiResponse<ApiProjectDetail>>(
          `/projects/${id}`
        );

        if (response.success) {
          const data = response.data;
          console.log("Post Detail Data:", data); // Debugging

          // Map API data to UI state
          const mappedFailures: FailureData[] = data.failure.map((item) => {
            const tag = Object.keys(item)[0];
            const answers = item[tag];
            const questions = TAG_DATA[tag] || ["질문 1", "질문 2", "질문 3"];
            return { tag, questions, answers };
          });

          const isFree = data.is_free === "true" || data.is_free === true;
          const visibility = isFree
            ? "free"
            : data.sale_status === "ONSALE"
            ? "paid"
            : "private";

          setPost({
            title: data.name,
            thumbnail: data.project_image,
            duration: data.period,
            likes: 0, // API doesn't provide likes yet
            author: data.nickname,
            authorId: String(data.user_id),
            role: data.my_role,
            teamSize: data.personnel,
            tags: data.failure_category,
            visibility: visibility,
            price: data.price,
            resultLink: data.result_url,
            goal: data.intent,
            failures: mappedFailures,
            lessons: data.growth_point,
          });

          setIsUnlocked(visibility !== "paid");
        } else {
          setError(response.message || "글을 불러오는데 실패했습니다.");
        }
      } catch (err) {
        console.error(err);
        setError("서버 통신 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handlePurchase = async () => {
    if (!post) return;

    if (
      confirm(
        `${post.price.toLocaleString()} 포인트를 사용하여 열람하시겠습니까?`
      )
    ) {
      try {
        const response = await api.post(`/users/projects/${id}/purchase`, {
          price: post.price,
        });

        if (response.success) {
          alert("구매가 완료되었습니다.");
          setIsUnlocked(true);
        } else {
          alert(response.message || "구매에 실패했습니다.");
        }
      } catch (error) {
        console.error("Purchase failed", error);
        alert("구매 처리 중 오류가 발생했습니다.");
      }
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!post || !id || isLiking) {
      return;
    }

    // Check if user is logged in
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    setIsLiking(true);

    try {
      // If already liked, remove the like (DELETE)
      if (isLiked) {
        try {
          const response = await api.delete<ApiResponse>(
            `/users/projects/${id}/helpful`
          );

          if (response.success || response.code === 200) {
            // Toggle like state
            setIsLiked(false);

            // Update likes count
            setPost((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                likes: Math.max(0, prev.likes - 1),
              };
            });
          }
        } catch (deleteErr: any) {
          console.error("Unlike error:", deleteErr);
          // If DELETE fails, just update local state (optimistic update)
          setIsLiked(false);
          setPost((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              likes: Math.max(0, prev.likes - 1),
            };
          });
        }
      } else {
        // Add like (POST)
        const response = await api.post<
          ApiResponse<{
            user: {
              user_id: number;
              project_id: number;
              userprojecthelpful_id: number;
            };
          }>
        >(`/users/projects/${id}/helpful`, {});

        if (response.success) {
          // Toggle like state
          setIsLiked(true);

          // Update likes count
          setPost((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              likes: prev.likes + 1,
            };
          });
        } else {
          // Handle error cases
          if (
            response.code === 400 &&
            response.message === "Helpful already exists"
          ) {
            // Already liked - update local state
            setIsLiked(true);
            setPost((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                likes: prev.likes + 1,
              };
            });
          } else if (response.code === 404) {
            alert("프로젝트를 찾을 수 없습니다.");
          } else if (response.code === 400) {
            alert(response.message || "잘못된 요청입니다.");
          } else {
            alert(response.message || "좋아요 처리 중 오류가 발생했습니다.");
          }
        }
      }
    } catch (err: any) {
      console.error("Like error:", err);

      // Handle 400 Conflict (already liked) - update local state
      if (err.code === 400 && err.message === "Helpful already exists") {
        setIsLiked(true);
        setPost((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            likes: prev.likes + 1,
          };
        });
      } else if (err.code === 401 || err.message === "Unauthorized") {
        // API에서 이미 리다이렉트 처리하므로 여기서는 알림만
        console.log("Unauthorized - redirecting to login");
      } else if (err.code === 404) {
        alert("프로젝트를 찾을 수 없습니다.");
      } else if (err.code === 400) {
        alert(err.message || "잘못된 요청입니다.");
      } else {
        // For other errors, try optimistic update
        if (!isLiked) {
          setIsLiked(true);
          setPost((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              likes: prev.likes + 1,
            };
          });
        }
      }
    } finally {
      setIsLiking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-500">{error || "글을 찾을 수 없습니다."}</p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700"
        >
          뒤로 가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 pt-24 pb-32">
        {/* Header Section */}
        <header className="mb-20">
          {/* 0. Thumbnail */}
          {post.thumbnail ? (
            <div className="mb-10 aspect-video w-full overflow-hidden rounded-3xl border border-zinc-100 bg-zinc-50 shadow-sm">
              <img
                src={post.thumbnail}
                alt="Thumbnail"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="mb-10 aspect-21/9 w-full overflow-hidden rounded-3xl bg-linear-to-br from-orange-50 to-orange-100 border border-orange-100/50 flex items-center justify-center">
              <span className="text-orange-300 font-bold text-2xl">
                썸네일 없음
              </span>
            </div>
          )}

          {/* 1. Title & Like */}
          <div className="mb-8 flex items-start justify-between gap-6">
            <h1 className="text-5xl font-black tracking-tight text-zinc-900 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-3">
              {currentUserId === post.authorId && (
                <Link
                  href={`/post-edit/${id}`}
                  className="group flex flex-col items-center justify-center rounded-2xl bg-zinc-50 px-4 py-3 transition-all hover:bg-zinc-100 hover:scale-105 active:scale-95"
                >
                  <PencilIcon className="h-7 w-7 text-zinc-400 transition-colors group-hover:text-zinc-600" />
                  <span className="mt-1 text-xs font-bold text-zinc-500 transition-colors group-hover:text-zinc-600">
                    수정
                  </span>
                </Link>
              )}
              <button
                type="button"
                onClick={handleLike}
                disabled={isLiking}
                className={`group flex flex-col items-center justify-center rounded-2xl bg-zinc-50 px-4 py-3 transition-all hover:bg-orange-50 hover:scale-105 active:scale-95 ${
                  isLiking ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
                style={{ pointerEvents: isLiking ? "none" : "auto" }}
              >
                <HeartIcon
                  className={`h-7 w-7 transition-colors ${
                    isLiked
                      ? "text-orange-500 fill-orange-500"
                      : "text-zinc-400 group-hover:text-orange-500 fill-transparent group-hover:fill-orange-500"
                  }`}
                />
                <span
                  className={`mt-1 text-xs font-bold transition-colors ${
                    isLiked
                      ? "text-orange-600"
                      : "text-zinc-500 group-hover:text-orange-600"
                  }`}
                >
                  {post.likes}
                </span>
              </button>
            </div>
          </div>

          {/* 2. Tags */}
          <div className="mb-10 flex flex-wrap items-center gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-200"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* 3. Meta Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-3xl bg-zinc-50/50 border border-zinc-100 p-8">
            <div className="space-y-6">
              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-zinc-100 text-zinc-400">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    작성자
                  </p>
                  <p className="font-bold text-zinc-900 text-lg">
                    {post.author}
                  </p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-zinc-100 text-zinc-400">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    역할
                  </p>
                  <p className="font-bold text-zinc-900 text-lg">{post.role}</p>
                </div>
              </div>

              {/* Team Size */}
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-zinc-100 text-zinc-400">
                  <UsersIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    팀 규모
                  </p>
                  <p className="font-bold text-zinc-900 text-lg">
                    {post.teamSize} 명
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Duration */}
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-zinc-100 text-zinc-400">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    진행 기간
                  </p>
                  <p className="font-bold text-zinc-900 text-lg">
                    {post.duration}
                  </p>
                </div>
              </div>

              {/* Result Link */}
              {post.resultLink && (
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-zinc-100 text-zinc-400">
                    <LinkIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      결과물
                    </p>
                    {isUnlocked ? (
                      <a
                        href={post.resultLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-bold text-orange-500 hover:text-orange-600 hover:underline decoration-2 underline-offset-4"
                      >
                        프로젝트 보러가기
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                          {post.visibility === "paid"
                            ? `₩${post.price.toLocaleString()}`
                            : "무료"}
                        </span>
                      </a>
                    ) : (
                      <button
                        onClick={handlePurchase}
                        className="mt-1 flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-bold text-white transition-colors hover:bg-zinc-700"
                      >
                        <LockIcon className="h-3 w-3" />
                        <span>
                          {post.price.toLocaleString()}P로 결과물 확인
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="space-y-20">
          {/* Topic 1: Goal */}
          <section className="relative">
            <div className="absolute -left-4 top-0 h-full w-1 bg-linear-to-b from-orange-500 to-orange-200 rounded-full opacity-20 md:-left-8"></div>
            <div className="flex items-center gap-3 mb-6">
              <QuoteIcon className="h-6 w-6 text-orange-500 fill-orange-500" />
              <h2 className="text-2xl font-black text-zinc-900">
                프로젝트 목표
              </h2>
            </div>
            <div className="text-xl font-medium leading-relaxed text-zinc-700 pl-2">
              "{post.goal}"
            </div>
          </section>

          {/* Topic 2: Failures */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <MessageCircleIcon className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl font-black text-zinc-900">
                실패 경험 & 도전
              </h2>
            </div>

            <div className="grid gap-8">
              {post.failures.map((failure, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white transition-all hover:shadow-xl hover:shadow-orange-500/5 hover:border-orange-200"
                >
                  <div className="absolute top-0 left-0 h-full w-1.5 bg-zinc-100 group-hover:bg-orange-500 transition-colors"></div>
                  <div className="p-8 pl-10">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-500 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                        #{failure.tag}
                      </span>
                    </div>

                    <div className="space-y-6">
                      {failure.questions.map((question, qIndex) => (
                        <div key={qIndex}>
                          <h3 className="mb-2 text-lg font-bold text-zinc-900">
                            Q. {question}
                          </h3>
                          <div className="rounded-2xl bg-zinc-50 p-6 text-lg leading-relaxed text-zinc-700 group-hover:bg-orange-50/30 transition-colors">
                            {failure.answers[qIndex]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Topic 3: Lessons */}
          <section>
            <div className="rounded-3xl bg-zinc-900 p-10 text-white shadow-2xl shadow-zinc-200">
              <div className="flex items-center gap-3 mb-6">
                <LightbulbIcon className="h-6 w-6 text-yellow-400" />
                <h2 className="text-2xl font-black text-white">배운 점</h2>
              </div>
              <div className="text-lg leading-relaxed text-zinc-300 font-medium">
                {post.lessons}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
