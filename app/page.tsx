"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "./_components/Navbar";
import { AVAILABLE_TAGS } from "../lib/tags";
import { api, ApiResponse } from "../lib/api";
import { HeartIcon } from "lucide-react";

interface HelpfulProject {
  name: string;
  user: string;
  project_id: number;
  project_image: string;
  period: string;
  sale_status: string;
  is_free: string | boolean;
  helpful_count: number;
  price: number;
  failure_catagory: string[];
}

interface HelpfulProjectsResponse {
  data_total: number;
  projects: HelpfulProject[];
}

interface Project {
  name: string;
  project_id: number;
  project_image: string | null;
  user: string;
  user_id: number;
  nickname: string;
  profile_image: string | null;
  period: string;
  personnel: number;
  intent: string;
  my_role: string;
  sale_status: string;
  is_free: string | boolean;
  price: number;
  helpful_count: number;
  is_helpful: boolean;
  result_url: string;
  failure_category: string[];
  failure: Record<string, string[]>[];
  growth_point: string;
}

interface ProjectsResponse {
  data_total: number;
  projects: Project[];
}

export default function MainPage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchType, setSearchType] = useState<"post" | "profile">("post");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagPickerOpen, setIsTagPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const executeSearch = (
    query: string,
    type: "post" | "profile",
    categories: string[] = selectedTags
  ) => {
    const trimmed = query.trim();
    const params = new URLSearchParams();
    params.set("type", type);
    if (trimmed) {
      params.set("q", trimmed);
    }
    if (categories.length) {
      const encodedCategories = categories
        .map((tag) => encodeURIComponent(tag))
        .join(",");
      params.set("categories", encodedCategories);
    }
    router.push(`/search?${params.toString()}`);
  };

  const handleHeroSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    executeSearch(searchQuery, searchType, selectedTags);
  };

  // Helpful projects state
  const [allHelpfulProjects, setAllHelpfulProjects] = useState<HelpfulProject[]>([]);
  const [helpfulLoading, setHelpfulLoading] = useState(false);
  const [helpfulError, setHelpfulError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [likingProjects, setLikingProjects] = useState<Set<number>>(new Set());
  const itemsPerPage = 6;

  // Popular and Recent posts state
  const [popularPosts, setPopularPosts] = useState<Project[]>([]);
  const [recentPosts, setRecentPosts] = useState<Project[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // Calculate paginated projects
  const helpfulProjects = allHelpfulProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const handleScroll = () => {
      // 스크롤 위치에 따라 상태 변경 (Two-component transition)
      if (window.scrollY > 300) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Helper function to decode JWT token and get user ID
  const getUserIdFromToken = (token: string): string | null => {
    try {
      // JWT tokens have 3 parts separated by dots
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      // Decode the payload (second part)
      const payload = JSON.parse(atob(parts[1]));

      // Try different possible fields for user ID
      return payload.user_id || payload.userId || payload.id || payload.sub || null;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Fetch helpful projects
  useEffect(() => {
    const fetchHelpfulProjects = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (!token) {
        // Not logged in, don't show helpful projects
        return;
      }

      // Get user ID from token
      const userId = getUserIdFromToken(token) ||
        (typeof window !== "undefined" ? localStorage.getItem("userId") : null);

      if (!userId) {
        // User ID not available, skip fetching
        console.log("User ID not available");
        return;
      }

      setHelpfulLoading(true);
      setHelpfulError(null);

      try {
        // API might not support pagination, so we'll fetch all and paginate client-side
        // Or use query params if API supports it
        const response = await api.get<ApiResponse<HelpfulProjectsResponse>>(
          `/users/${userId}/helpful`
        );

        if (response.success) {
          // Store all projects and paginate client-side
          setAllHelpfulProjects(response.data.projects);
          setTotalItems(response.data.data_total);
          setTotalPages(Math.ceil(response.data.data_total / itemsPerPage));
        } else {
          // Handle errors
          if (response.code === 401) {
            // Not authenticated, clear token
            if (typeof window !== "undefined") {
              localStorage.removeItem("accessToken");
            }
            setHelpfulError(null); // Don't show error, just don't display section
          } else if (response.code === 404) {
            // User not found or no helpful projects
            setAllHelpfulProjects([]);
          } else {
            setHelpfulError(response.message || "좋아요한 글을 불러오는데 실패했습니다.");
          }
        }
      } catch (err: any) {
        console.error("Error fetching helpful projects:", err);
        if (err.code === 401 || err.message === "Unauthorized") {
          // Not authenticated
          setHelpfulError(null);
        } else {
          setHelpfulError("좋아요한 글을 불러오는데 실패했습니다.");
        }
      } finally {
        setHelpfulLoading(false);
      }
    };

    fetchHelpfulProjects();
  }, []); // Only fetch once on mount

  // Fetch popular and recent posts
  useEffect(() => {
    const fetchPosts = async () => {
      setPostsLoading(true);
      try {
        // Fetch popular posts from /projects/popular endpoint
        const popularResponse = await api.get<ApiResponse<ProjectsResponse>>(
          "/projects/popular"
        );
        if (popularResponse.success && popularResponse.data) {
          setPopularPosts(popularResponse.data.projects || []);
        }

        // Fetch recent posts - use same endpoint and sort by project_id descending
        // Higher project_id = more recent post
        const recentResponse = await api.get<ApiResponse<ProjectsResponse>>(
          "/projects/popular"
        );
        if (recentResponse.success && recentResponse.data) {
          // Sort by project_id descending (highest ID first = most recent)
          const sortedRecent = [...(recentResponse.data.projects || [])].sort(
            (a, b) => b.project_id - a.project_id
          );
          // Take only first 5
          setRecentPosts(sortedRecent.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        // Set empty arrays on error
        setPopularPosts([]);
        setRecentPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Handle unlike (remove from helpful projects)
  const handleUnlike = async (e: React.MouseEvent, projectId: number) => {
    e.preventDefault();
    e.stopPropagation();

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (likingProjects.has(projectId)) {
      return; // Already processing
    }

    setLikingProjects((prev) => new Set(prev).add(projectId));

    try {
      // DELETE request to remove helpful
      await api.delete<ApiResponse>(`/users/projects/${projectId}/helpful`);

      // Remove from local state
      setAllHelpfulProjects((prev) => prev.filter((p) => p.project_id !== projectId));
      setTotalItems((prev) => Math.max(0, prev - 1));
      setTotalPages((prev) => Math.ceil(Math.max(0, totalItems - 1) / itemsPerPage));
    } catch (err: any) {
      console.error("Unlike error:", err);
      if (err.code === 404) {
        // Already removed, just update local state
        setAllHelpfulProjects((prev) => prev.filter((p) => p.project_id !== projectId));
        setTotalItems((prev) => Math.max(0, prev - 1));
        setTotalPages((prev) => Math.ceil(Math.max(0, totalItems - 1) / itemsPerPage));
      } else {
        alert("좋아요 취소 중 오류가 발생했습니다.");
      }
    } finally {
      setLikingProjects((prev) => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Navigation Bar */}
      <Navbar
        isScrolled={isScrolled}
        searchType={searchType}
        setSearchType={setSearchType}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={(query, type) => executeSearch(query, type, selectedTags)}
      />

      {/* Main Content Flow */}
      <main className="flex flex-col items-center">
        {/* Hero Section (Scrolls naturally) */}
        <div className="mt-[20vh] mb-8 flex flex-col items-center px-4">
          <h1
            className={`text-center text-5xl font-extrabold tracking-tight text-orange-500 sm:text-6xl transition-opacity duration-300 ${isScrolled ? "opacity-0" : "opacity-100"
              }`}
          >
            Cistus
          </h1>
        </div>

        {/* Hero Search Container */}
        <div
          className={`flex w-full flex-col items-center px-4 transition-opacity duration-300 ${isScrolled ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
        >
          <form
            onSubmit={handleHeroSearch}
            className="relative w-full max-w-3xl"
          >
            <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-base font-bold text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                <span>{searchType === "post" ? "글" : "프로필"}</span>
                <ChevronDownIcon
                  className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-32 overflow-hidden rounded-xl border border-zinc-100 bg-white p-1 shadow-lg ring-1 ring-black/5">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchType("post");
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full rounded-lg px-4 py-2.5 text-left text-base font-medium transition-colors ${searchType === "post"
                      ? "bg-orange-50 text-orange-600"
                      : "text-zinc-600 hover:bg-zinc-50"
                      }`}
                  >
                    글
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchType("profile");
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full rounded-lg px-4 py-2.5 text-left text-base font-medium transition-colors ${searchType === "profile"
                      ? "bg-orange-50 text-orange-600"
                      : "text-zinc-600 hover:bg-zinc-50"
                      }`}
                  >
                    프로필
                  </button>
                </div>
              )}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchType === "post"
                  ? "찾고 싶은 글 내용을 검색해보세요"
                  : "찾고 싶은 프로필을 검색해보세요"
              }
              className="h-16 w-full rounded-2xl border-2 border-orange-100 bg-white pl-32 pr-32 text-lg shadow-xl shadow-orange-500/5 focus:border-orange-500 focus:outline-none transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <SearchIcon className="h-6 w-6 text-zinc-400" />
              <button
                type="submit"
                className="h-10 rounded-xl bg-orange-500 px-6 font-bold text-white transition-all duration-300 hover:bg-orange-600"
              >
                검색
              </button>
            </div>
          </form>

          {/* Tags Section */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {AVAILABLE_TAGS.slice(0, 5).map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${isSelected
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                    : "bg-zinc-100 text-zinc-600 hover:bg-orange-100 hover:text-orange-600"
                    }`}
                >
                  #{tag}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setIsTagPickerOpen(true)}
              className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-500 transition-colors hover:border-orange-300 hover:text-orange-500"
            >
              태그 더 보기
            </button>
          </div>
        </div>
        {isTagPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-zinc-900">실패 태그 선택</h2>
                <button
                  type="button"
                  onClick={() => setIsTagPickerOpen(false)}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold text-zinc-500 hover:bg-zinc-200"
                >
                  닫기
                </button>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${isSelected
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                        : "bg-zinc-100 text-zinc-600 hover:bg-orange-100 hover:text-orange-600"
                        }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTags([])}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-500 hover:border-zinc-400"
                >
                  선택 초기화
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsTagPickerOpen(false);
                    executeSearch(searchQuery, searchType, selectedTags);
                  }}
                  className="rounded-xl bg-orange-500 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-orange-600"
                >
                  선택 후 검색
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Spacer to separate posts from the hero area visually */}
        <div className="h-24"></div>

        {/* Content Sections */}
        <div className="w-full max-w-6xl space-y-12 px-6 pb-20">
          {/* Weekly Popular Posts */}
          <section>
            <h2 className="mb-6 text-2xl font-bold text-zinc-800">
              인기 글
            </h2>
            {postsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : popularPosts.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden">
                {popularPosts.map((post) => (
                  <Link
                    key={post.project_id}
                    href={`/post-detail/${post.project_id}`}
                    className="group min-w-[280px] cursor-pointer overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md sm:min-w-[320px]"
                  >
                    <div className="aspect-video w-full bg-zinc-100 transition-colors group-hover:bg-orange-50 overflow-hidden">
                      {post.project_image ? (
                        <img
                          src={post.project_image}
                          alt={post.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <span className="text-zinc-400 text-sm">이미지 없음</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                          Popular
                        </span>
                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                          <HeartIcon className="h-3 w-3 text-orange-500 fill-orange-500" />
                          <span>{post.helpful_count || 0}</span>
                        </div>
                      </div>
                      <h3 className="mb-1 text-lg font-bold text-zinc-900 group-hover:text-orange-500 line-clamp-2">
                        {post.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                        <span>{post.nickname}</span>
                        <span>•</span>
                        <span>{post.period}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.failure_category.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600"
                          >
                            #{tag}
                          </span>
                        ))}
                        {post.failure_category.length > 2 && (
                          <span className="text-[10px] text-zinc-400">
                            +{post.failure_category.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500">
                인기 글이 없습니다.
              </div>
            )}
          </section>

          {/* Recent Posts */}
          <section>
            <h2 className="mb-6 text-2xl font-bold text-zinc-800">최근 글</h2>
            {postsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : recentPosts.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden">
                {recentPosts.map((post) => (
                  <Link
                    key={post.project_id}
                    href={`/post-detail/${post.project_id}`}
                    className="group min-w-[280px] cursor-pointer overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md sm:min-w-[320px]"
                  >
                    <div className="aspect-video w-full bg-zinc-100 transition-colors group-hover:bg-orange-50 overflow-hidden">
                      {post.project_image ? (
                        <img
                          src={post.project_image}
                          alt={post.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <span className="text-zinc-400 text-sm">이미지 없음</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-xs text-zinc-400">최신</span>
                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                          <HeartIcon className="h-3 w-3 text-orange-500 fill-orange-500" />
                          <span>{post.helpful_count || 0}</span>
                        </div>
                      </div>
                      <h3 className="mb-1 text-lg font-bold text-zinc-900 group-hover:text-orange-500 line-clamp-2">
                        {post.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                        <span>{post.nickname}</span>
                        <span>•</span>
                        <span>{post.period}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.failure_category.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600"
                          >
                            #{tag}
                          </span>
                        ))}
                        {post.failure_category.length > 2 && (
                          <span className="text-[10px] text-zinc-400">
                            +{post.failure_category.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500">
                최근 글이 없습니다.
              </div>
            )}
          </section>

          {/* Helpful Projects (Liked Posts) */}
          {helpfulProjects.length > 0 && (
            <section>
              <h2 className="mb-6 text-2xl font-bold text-zinc-800">
                좋아요한 글
              </h2>
              {helpfulLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : helpfulError ? (
                <div className="text-center py-12 text-zinc-500">{helpfulError}</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {helpfulProjects.map((project) => (
                      <div
                        key={project.project_id}
                        className="group relative overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                      >
                        <Link
                          href={`/post-detail/${project.project_id}`}
                          className="block"
                        >
                          <div className="aspect-video w-full bg-zinc-100 transition-colors group-hover:bg-orange-50">
                            {project.project_image ? (
                              <img
                                src={project.project_image}
                                alt={project.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <span className="text-zinc-400 text-sm">이미지 없음</span>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <div className="mb-2 flex items-center gap-2 flex-wrap">
                              {project.failure_catagory.slice(0, 2).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {project.failure_catagory.length > 2 && (
                                <span className="text-[10px] text-zinc-400">
                                  +{project.failure_catagory.length - 2}
                                </span>
                              )}
                            </div>
                            <h3 className="mb-1 text-lg font-bold text-zinc-900 group-hover:text-orange-500 line-clamp-2">
                              {project.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-2">
                              <span>{project.user}</span>
                              <span>•</span>
                              <span>{project.period}</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {project.is_free === "true" || project.is_free === true ? (
                                  <span className="text-xs font-bold text-green-600">무료</span>
                                ) : project.sale_status === "SALE" ? (
                                  <span className="text-xs font-bold text-orange-600">
                                    ₩{project.price.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-xs font-bold text-zinc-400">비공개</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs font-medium text-zinc-500">
                                <HeartIcon className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
                                <span>{project.helpful_count || 0}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                        {/* Heart Icon Button */}
                        <button
                          type="button"
                          onClick={(e) => handleUnlike(e, project.project_id)}
                          disabled={likingProjects.has(project.project_id)}
                          className={`absolute top-4 right-4 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm p-2 shadow-md transition-all hover:bg-white hover:scale-110 active:scale-95 ${likingProjects.has(project.project_id)
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                            }`}
                          style={{ pointerEvents: likingProjects.has(project.project_id) ? "none" : "auto" }}
                        >
                          <HeartIcon
                            className={`h-5 w-5 transition-colors ${"text-orange-500 fill-orange-500"
                              }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        &lt;
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${currentPage === pageNum
                              ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20"
                              : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-orange-500 hover:border-orange-200"
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        &gt;
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <Link
        href="/post-publish"
        className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-110 hover:bg-orange-600 hover:shadow-orange-500/50"
      >
        <PencilIcon className="h-6 w-6" />
      </Link>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function PencilIcon({ className }: { className?: string }) {
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
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}
