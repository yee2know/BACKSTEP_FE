"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "../../_components/Navbar";
import {
  CalendarIcon,
  UsersIcon,
  XIcon,
  SparklesIcon,
  PlusIcon,
  LinkIcon,
  ImageIcon,
  UserIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { TAG_DATA, AVAILABLE_TAGS } from "../../../lib/tags";
import { api, ApiResponse } from "../../../lib/api";

interface FailureData {
  tag: string;
  questions: string[];
  answers: string[];
}

interface ApiProjectDetail {
  name: string;
  user: string;
  user_id: number;
  nickname: string;
  image: string;
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

export default function PostEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get<
          ApiResponse<{ user: { user_id: number } }>
        >("/users/me");
        if (response.success) {
          setCurrentUserId(String(response.data.user.user_id));
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Image upload states
  const [isPresigning, setIsPresigning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // State for the post being edited
  const [post, setPost] = useState({
    title: "",
    thumbnail: null as string | null,
    duration: "",
    likes: 0,
    author: "",
    authorId: "", // To store 'user' field from API
    role: "",
    teamSize: 0,
    tags: [] as string[],
    visibility: "free", // private, free, paid
    price: 0,
    resultLink: "",
    goal: "",
    failures: [] as FailureData[],
    lessons: "",
  });

  // Fetch existing data
  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const response = await api.get<ApiResponse<ApiProjectDetail>>(
          `/projects/${id}`
        );

        if (response.success) {
          const data = response.data;

          // Map API data to UI state
          const mappedFailures: FailureData[] = data.failure.map(
            (item: Record<string, string[]>) => {
              const tag = Object.keys(item)[0];
              const answers = item[tag];
              const questions = TAG_DATA[tag] || ["질문 1", "질문 2", "질문 3"];
              return { tag, questions, answers };
            }
          );

          const isPrivate = data.sale_status === "NOTSALE";
          const visibility = isPrivate ? "private" : "public";

          setPost({
            title: data.name,
            thumbnail: data.image,
            duration: data.period,
            likes: 0,
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

          // Set date states from duration string if possible
          if (data.period.includes(" - ")) {
            const [start, end] = data.period.split(" - ");
            setStartDate(start);
            setEndDate(end);
          } else if (data.period.includes(" ~ ")) {
            const [start, end] = data.period.split(" ~ ");
            setStartDate(start);
            setEndDate(end);
          }
        } else {
          alert(response.message || "글을 불러오는데 실패했습니다.");
          router.push("/");
        }
      } catch (err) {
        console.error(err);
        alert("서버 통신 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, router]);

  const [newTag, setNewTag] = useState("");

  // Date states
  const [startDate, setStartDate] = useState("2024.01.15");
  const [endDate, setEndDate] = useState("2024.03.20");

  // Sync dates to post.duration
  useEffect(() => {
    setPost((prev) => ({ ...prev, duration: `${startDate} ~ ${endDate}` }));
  }, [startDate, endDate]);

  const visibilityOptions = [
    { id: "private", label: "비공개" },
    { id: "public", label: "공개" },
  ];

  // Handlers
  const handleInputChange = (field: string, value: any) => {
    setPost((prev) => ({ ...prev, [field]: value }));
  };

  const handleFailureChange = (
    failureIndex: number,
    answerIndex: number,
    value: string
  ) => {
    const newFailures = [...post.failures];
    const newAnswers = [...newFailures[failureIndex].answers];
    newAnswers[answerIndex] = value;
    newFailures[failureIndex] = {
      ...newFailures[failureIndex],
      answers: newAnswers,
    };
    setPost((prev) => ({ ...prev, failures: newFailures }));
  };

  const removeFailure = (index: number) => {
    setPost((prev) => ({
      ...prev,
      failures: prev.failures.filter((_, i) => i !== index),
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !post.tags.includes(tag)) {
      const questions = TAG_DATA[tag] || [
        `${tag} 관련 가장 큰 어려움은 무엇이었나요?`,
        "해결 과정은 어땠나요?",
        "배운 점은 무엇인가요?",
      ];

      setPost((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
        failures: [
          ...prev.failures,
          {
            tag: tag,
            questions: questions,
            answers: ["", "", ""],
          },
        ],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPost((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
      failures: prev.failures.filter((f) => f.tag !== tagToRemove),
    }));
  };

  const uploadProjectImage = async (file: File) => {
    setIsPresigning(true);
    setIsUploading(false);
    setUploadError(null);

    try {
      const payload = {
        filename: file.name,
        fileType: file.type,
        type: "project",
      };

      const response = await api.post<{
        success: boolean;
        code: number;
        message: string;
        data: {
          presignedUrl: string;
          publicUrl: string;
          key: string;
        };
      }>("/images/presigned", payload);

      const { presignedUrl, publicUrl } = response.data;

      setIsPresigning(false);
      setIsUploading(true);

      await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      handleInputChange("thumbnail", publicUrl);
    } catch (error) {
      console.error("Failed to upload project image", error);
      setUploadError(
        "이미지를 업로드하지 못했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setIsPresigning(false);
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!post.title || !post.goal || !post.lessons) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    // Validation
    if (post.visibility !== "private" && !post.resultLink.trim()) {
      alert("무료/유료 공개 시 결과물 링크는 필수입니다.");
      return;
    }

    if (
      post.resultLink.trim() &&
      !/^https?:\/\//.test(post.resultLink.trim())
    ) {
      alert(
        "링크는 'http://' 또는 'https://'로 시작하는 전체 URL이어야 합니다."
      );
      return;
    }

    const isPublic = post.visibility === "public";

    setSaving(true);
    try {
      const payload = {
        name: post.title,
        image: post.thumbnail,
        period: `${startDate} ~ ${endDate}`,
        personnel: post.teamSize,
        intent: post.goal,
        my_role: post.role,
        sale_status: !isPublic ? "NOTSALE" : "ONSALE",
        is_free: false,
        price: post.price,
        result_url: post.resultLink,
        failure_category: post.tags,
        failure: post.failures.map((f) => ({ [f.tag]: f.answers })),
        growth_point: post.lessons,
      };

      console.log("Sending payload:", payload); // Debug payload

      const response = await api.patch(`/projects/${id}`, payload);

      if (response.success) {
        alert("글 수정이 완료되었습니다.");
        router.push(`/post-detail/${id}`);
      } else {
        alert(response.message || "글 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to save post", error);
      alert("서버 통신 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // Check authorization
  useEffect(() => {
    if (!loading && currentUserId && post.authorId) {
      if (currentUserId !== post.authorId) {
        alert("수정 권한이 없습니다.");
        router.push(`/post-detail/${id}`);
      }
    }
  }, [loading, currentUserId, post.authorId, router, id]);

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 pt-24 pb-20">
        {/* Header Section */}
        <header className="mb-16 mx-auto max-w-4xl">
          {/* 0. Thumbnail Upload */}
          <div className="mb-8">
            <div className="group relative flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 transition-all hover:border-orange-500 hover:bg-orange-50">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 z-10 cursor-pointer opacity-0"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    uploadProjectImage(file);
                  }
                }}
              />
              {post.thumbnail ? (
                <img
                  src={post.thumbnail}
                  alt="Thumbnail"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-400 transition-colors group-hover:text-orange-500">
                  <ImageIcon className="h-12 w-12" />
                  <span className="text-sm font-bold">
                    대표 사진을 업로드하세요
                  </span>
                </div>
              )}
              {(isPresigning || isUploading) && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
                    <span className="text-sm font-bold text-orange-500">
                      {isPresigning ? "준비중..." : "업로드중..."}
                    </span>
                  </div>
                </div>
              )}
            </div>
            {uploadError && (
              <p className="mt-2 text-center text-sm font-bold text-red-500">
                {uploadError}
              </p>
            )}
          </div>

          {/* 1. Title */}
          <div className="mb-8">
            <input
              type="text"
              value={post.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="프로젝트 제목을 입력하세요"
              className="w-full bg-transparent text-4xl font-black tracking-tight text-zinc-900 placeholder:text-zinc-200 focus:outline-none"
            />
          </div>

          {/* 2. Meta Info & Visibility Control Bar */}
          <div className="mb-8 flex flex-col gap-6 rounded-2xl bg-zinc-50 p-6 md:flex-row md:items-start md:justify-between">
            {/* Left: Meta Info (Role, Team, Duration) */}
            <div className="space-y-4">
              {/* Role */}
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span>나의 역할</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={post.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    placeholder="역할을 입력하세요"
                    className="w-40 border-b border-zinc-300 bg-transparent text-center font-bold text-zinc-900 placeholder:text-zinc-300 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Team Size */}
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4" />
                  <span>참여 인원</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={post.teamSize}
                    onChange={(e) =>
                      handleInputChange(
                        "teamSize",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-10 border-b border-zinc-300 bg-transparent text-center font-bold text-zinc-900 focus:border-orange-500 focus:outline-none"
                  />
                  <span>명</span>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>진행 기간</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="YYYY.MM.DD"
                    className="w-24 border-b border-zinc-300 bg-transparent text-center font-medium text-zinc-900 placeholder:text-zinc-300 focus:border-orange-500 focus:outline-none"
                  />
                  <span>-</span>
                  <input
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="진행중"
                    className="w-24 border-b border-zinc-300 bg-transparent text-center font-medium text-zinc-900 placeholder:text-zinc-300 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Right: Visibility */}
            <div className="flex flex-col items-end gap-3">
              <div className="flex rounded-lg bg-zinc-100 p-1 shadow-sm ring-1 ring-zinc-200 opacity-70 cursor-not-allowed">
                {visibilityOptions.map((option) => (
                  <button
                    key={option.id}
                    disabled
                    className={`relative px-4 py-1.5 text-sm font-bold rounded-md transition-all cursor-not-allowed ${
                      post.visibility === option.id
                        ? "text-white bg-zinc-500"
                        : "text-zinc-400"
                    }`}
                  >
                    <span className="relative z-10">{option.label}</span>
                  </button>
                ))}
              </div>
              {post.visibility === "public" && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 opacity-70">
                  <input
                    type="number"
                    value={post.price}
                    disabled
                    className="w-20 border-b border-zinc-300 bg-transparent text-right font-bold text-zinc-500 focus:outline-none cursor-not-allowed"
                  />
                  <span className="text-sm font-bold text-zinc-500">원</span>
                </div>
              )}

              {/* Result Link Input */}
              {post.visibility !== "private" && (
                <div className="mt-2 flex w-full flex-col items-end gap-1 opacity-70">
                  <div className="flex w-full items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 shadow-sm ring-1 ring-zinc-200">
                    <LinkIcon className="h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      value={post.resultLink}
                      disabled
                      className="w-full bg-transparent text-sm font-medium text-zinc-500 focus:outline-none cursor-not-allowed"
                    />
                  </div>
                  {post.visibility === "public" && (
                    <span className="text-xs font-bold text-orange-500">
                      * 구매자에게만 공개됩니다
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 4. Tags */}
          <div className="flex flex-col gap-3">
            <span className="text-xl font-bold text-zinc-700">태그</span>
            <div className="flex flex-wrap items-center gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-200"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 rounded-full p-0.5 hover:bg-zinc-300"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <div className="relative group">
                <button className="flex items-center gap-1 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-zinc-400 ring-1 ring-zinc-200 transition-all group-hover:bg-zinc-50 group-hover:text-zinc-600 group-hover:ring-zinc-300">
                  <PlusIcon className="h-3.5 w-3.5" />
                  <span>태그 추가</span>
                </button>
                <select
                  value=""
                  onChange={(e) => {
                    addTag(e.target.value);
                  }}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                >
                  <option value="">태그 추가</option>
                  {AVAILABLE_TAGS.filter(
                    (tag: string) => !post.tags.includes(tag)
                  ).map((tag: string) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="space-y-12">
          {/* Topic 1: Goal */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-orange-500">
              1. 프로젝트 설명
            </h2>
            <textarea
              value={post.goal}
              onChange={(e) => handleInputChange("goal", e.target.value)}
              className="h-32 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-zinc-700 focus:border-orange-500 focus:outline-none"
              placeholder="프로젝트의 설명을 작성해주세요."
            />
          </section>

          {/* Topic 2: Failures */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-orange-500">
                2. 실패 경험 (태그별 회고)
              </h2>
            </div>
            <div className="space-y-8">
              {post.failures.map((failure, index) => (
                <div
                  key={index}
                  className="relative rounded-xl border border-zinc-100 bg-zinc-50 p-6"
                >
                  {/* Tag Selection for Failure (Read-only) */}
                  <div className="mb-4">
                    <label className="mb-1 block text-xs font-bold text-zinc-500">
                      관련 태그
                    </label>
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-bold text-zinc-700">
                      {failure.tag}
                    </div>
                  </div>

                  {/* Questions and Answers */}
                  <div className="space-y-6">
                    {failure.questions.map((question, qIndex) => (
                      <div key={qIndex}>
                        {/* Question */}
                        <div className="mb-2">
                          <label className="mb-1 block text-xs font-bold text-zinc-500">
                            질문 {qIndex + 1}
                          </label>
                          <div className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-bold text-zinc-500">
                            {question}
                          </div>
                        </div>

                        {/* Answer */}
                        <div>
                          <label className="mb-1 block text-xs font-bold text-zinc-500">
                            답변
                          </label>
                          <textarea
                            value={failure.answers[qIndex]}
                            onChange={(e) =>
                              handleFailureChange(index, qIndex, e.target.value)
                            }
                            className="h-24 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:border-orange-500 focus:outline-none"
                            placeholder="답변을 입력하세요"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Topic 3: Lessons */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-orange-500">
              3. 배운 점
            </h2>
            <textarea
              value={post.lessons}
              onChange={(e) => handleInputChange("lessons", e.target.value)}
              className="h-32 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-zinc-700 focus:border-orange-500 focus:outline-none"
              placeholder="이번 프로젝트를 통해 배운 점을 작성해주세요."
            />
          </section>
        </div>

        {/* Save Button (Moved to Bottom) */}
        <div className="mt-12 flex justify-end border-t border-zinc-100 pt-8">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-8 py-3 text-base font-bold text-white transition-colors hover:bg-zinc-700"
          >
            <SaveIcon className="h-5 w-5" />
            {saving ? "저장중..." : "저장하기"}
          </button>
        </div>
      </main>
    </div>
  );
}

// Icons
function SaveIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
