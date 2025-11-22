"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "../_components/Navbar";
import { AVAILABLE_TAGS } from "../../lib/tags";
import { api, ApiResponse } from "../../lib/api";

interface SearchProjectResult {
  name: string;
  project_id: number;
  project_image: string | null;
  user: string;
  user_id: number;
  nickname: string | null;
  profile_image: string | null;
  period: string;
  sale_status: string;
  is_free: string | boolean;
  price: number;
  failure_category: string[];
}

interface SearchUserResult {
  name?: string;
  user_id: number;
  nickname: string | null;
  profile_image: string | null;
  failure_category?: string[];
}

type SearchApiItem = SearchProjectResult | SearchUserResult;

interface SearchApiData {
  keyword: string;
  type: "project" | "user";
  failure_category: string[];
  data_total: number;
  data_search: SearchApiItem[];
}

type FilterType = "all" | "private" | "free" | "paid";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const getCategoriesFromParams = () => {
    const raw = searchParams.get("categories");
    if (!raw) return [];
    return raw
      .split(",")
      .map((item) => decodeURIComponent(item.trim()))
      .filter(Boolean);
  };

  const [filter, setFilter] = useState<FilterType>("all");
  const [searchType, setSearchType] = useState<"post" | "profile">(() =>
    searchParams.get("type") === "profile" ? "profile" : "post"
  );
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") ?? ""
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    getCategoriesFromParams
  );
  const [results, setResults] = useState<SearchApiItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [responseMeta, setResponseMeta] = useState<{
    keyword: string;
    type: "project" | "user";
    failure_category: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<
    Record<number, { bio: string | null }>
  >({});

  useEffect(() => {
    setSearchType(searchParams.get("type") === "profile" ? "profile" : "post");
    setSearchQuery(searchParams.get("q") ?? "");
    setSelectedCategories(getCategoriesFromParams());
  }, [searchParams]);

  const executeSearch = (
    query: string,
    type: "post" | "profile",
    categories: string[] = selectedCategories
  ) => {
    const trimmed = query.trim();
    const params = new URLSearchParams();
    params.set("type", type);
    if (trimmed) {
      params.set("q", trimmed);
    }
    if (categories.length) {
      const encoded = categories
        .map((tag) => encodeURIComponent(tag))
        .join(",");
      params.set("categories", encoded);
    }
    router.push(`/search?${params.toString()}`);
  };

  const toggleCategory = (tag: string) => {
    setSelectedCategories((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  useEffect(() => {
    const keyword = searchParams.get("q") ?? "";
    const categories = getCategoriesFromParams();
    const typeParam =
      searchParams.get("type") === "profile" ? "user" : "project";

    if (!keyword && categories.length === 0 && typeParam === "project") {
      setResults([]);
      setTotalResults(0);
      setResponseMeta(null);
      return;
    }

    let isCancelled = false;

    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.post<ApiResponse<SearchApiData>>(
          "/search",
          {
            type: typeParam,
            keyword,
            failure_catagory: categories,
            failure_category: categories,
          }
        );

        if (!response.success) {
          throw new Error(response.message || "검색에 실패했습니다.");
        }

        if (isCancelled) return;

        setResults(response.data.data_search);
        setTotalResults(response.data.data_total);
        setResponseMeta({
          keyword: response.data.keyword,
          type: response.data.type,
          failure_category: response.data.failure_category,
        });
      } catch (err: any) {
        if (isCancelled) return;
        console.error("Search error:", err);
        setError(
          err?.message ||
            "검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        );
        setResults([]);
        setTotalResults(0);
        setResponseMeta(null);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchSearchResults();

    return () => {
      isCancelled = true;
    };
  }, [searchParams]);

  useEffect(() => {
    if (responseMeta?.type !== "user") return;

    const uniqueIds = Array.from(
      new Set(
        results
          .map((item) => (item as SearchUserResult).user_id)
          .filter((id): id is number => typeof id === "number")
      )
    ).filter((id) => userDetails[id] === undefined);

    if (uniqueIds.length === 0) return;

    let cancelled = false;

    const fetchDetails = async () => {
      try {
        const responses = await Promise.all(
          uniqueIds.map(async (id) => {
            const res = await api.get<
              ApiResponse<{ user: { bio: string | null } }>
            >(`/users/${id}`);
            return [id, res.data.user.bio ?? null] as const;
          })
        );

        if (cancelled) return;

        setUserDetails((prev) => {
          const next = { ...prev };
          for (const [id, bio] of responses) {
            next[id] = { bio };
          }
          return next;
        });
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch user details", err);
        }
      }
    };

    fetchDetails();

    return () => {
      cancelled = true;
    };
  }, [results, responseMeta, userDetails]);

  const isProjectResult = (
    item: SearchApiItem
  ): item is SearchProjectResult => {
    return typeof (item as SearchProjectResult).project_id === "number";
  };

  const filteredResults = useMemo(() => {
    if (responseMeta?.type === "user") {
      return results;
    }
    return results.filter((item) => {
      if (!isProjectResult(item)) {
        return true;
      }
      if (filter === "all") return true;
      if (filter === "free") {
        return item.is_free === true || item.is_free === "true";
      }
      if (filter === "paid") {
        return (
          item.sale_status === "SALE" ||
          item.is_free === false ||
          item.is_free === "false"
        );
      }
      if (filter === "private") {
        return item.sale_status === "NOTSALE";
      }
      return true;
    });
  }, [results, filter, responseMeta]);

  const headerKeyword = responseMeta?.keyword || searchQuery || "검색어";
  const handleNavbarSearch = (query: string, type: "post" | "profile") =>
    executeSearch(query, type, selectedCategories);

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Navbar
        isScrolled={true}
        searchType={searchType}
        setSearchType={setSearchType}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleNavbarSearch}
      />

      <main className="pt-24 px-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col gap-4 border-b border-zinc-100 pb-6 mb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-400">
              <span className="text-zinc-900">"{headerKeyword}"</span> 검색결과
            </h1>
            {responseMeta?.failure_category?.length ? (
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
                {responseMeta.failure_category.map((category) => (
                  <span
                    key={category}
                    className="rounded-full bg-zinc-100 px-2 py-0.5 font-semibold text-zinc-500"
                  >
                    #{category}
                  </span>
                ))}
              </div>
            ) : null}
            <p className="mt-2 text-sm text-zinc-400">
              총 {totalResults.toLocaleString()}개의 결과
            </p>
          </div>

          {responseMeta?.type !== "user" && (
            <div className="flex items-center bg-zinc-100 p-1 rounded-xl">
              <FilterButton
                label="모두"
                isActive={filter === "all"}
                onClick={() => setFilter("all")}
              />
              <FilterButton
                label="비공개"
                isActive={filter === "private"}
                onClick={() => setFilter("private")}
              />
              <FilterButton
                label="무료 공개"
                isActive={filter === "free"}
                onClick={() => setFilter("free")}
              />
              <FilterButton
                label="유료 공개"
                isActive={filter === "paid"}
                onClick={() => setFilter("paid")}
              />
            </div>
          )}
        </div>

        <div className="mb-10 rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
          <div className="flex items-center justify-between gap-4 mb-3">
            <p className="text-sm font-semibold text-zinc-600">
              실패 카테고리 선택 ({selectedCategories.length})
            </p>
            {selectedCategories.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedCategories([])}
                className="text-sm font-medium text-zinc-500 hover:text-zinc-800"
              >
                선택 초기화
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map((tag: string) => {
              const isSelected = selectedCategories.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleCategory(tag)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isSelected
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                      : "bg-white text-zinc-600 hover:bg-orange-100 hover:text-orange-600"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => executeSearch(searchQuery, searchType, selectedCategories)}
              className="rounded-xl bg-orange-500 px-6 py-2 text-sm font-bold text-white transition-all hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30"
            >
              조건으로 검색
            </button>
            {selectedCategories.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategories([]);
                  executeSearch(searchQuery, searchType, []);
                }}
                className="rounded-xl border border-orange-200 px-6 py-2 text-sm font-bold text-orange-500 transition-all hover:bg-orange-50"
              >
                필터 초기화 후 검색
              </button>
            )}
          </div>
        </div>

        <section className="pb-20">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
            </div>
          ) : error ? (
            <div className="py-20 text-center text-red-500">{error}</div>
          ) : filteredResults.length === 0 ? (
            <div className="py-20 text-center text-zinc-400">
              검색 결과가 없습니다.
            </div>
          ) : responseMeta?.type === "user" ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredResults.map((item) => (
                <Link
                  key={`user-${(item as SearchUserResult).user_id}`}
                  href={`/profile/${(item as SearchUserResult).user_id}`}
                  className="block"
                >
                  <UserResultCard
                    user={item as SearchUserResult}
                    bio={
                      userDetails[(item as SearchUserResult).user_id]?.bio ??
                      null
                    }
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredResults
                .filter(isProjectResult)
                .map((project) => (
                  <ProjectResultCard
                    key={`project-${project.project_id}`}
                    project={project}
                  />
                ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// Helper Components

function FilterButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isActive
          ? "bg-white text-orange-600 shadow-sm"
          : "text-zinc-500 hover:text-zinc-700"
        }`}
    >
      {label}
    </button>
  );
}

function ProjectResultCard({ project }: { project: SearchProjectResult }) {
  const isFree =
    project.is_free === true || project.is_free === "true";
  const isPaid =
    project.sale_status === "SALE" ||
    project.is_free === false ||
    project.is_free === "false";
  const priceLabel = isFree
    ? "무료"
    : isPaid
      ? `₩${project.price.toLocaleString()}`
      : "비공개";

  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <Link href={`/post-detail/${project.project_id}`} className="block h-full">
        <div className="aspect-video w-full bg-zinc-100 transition-colors group-hover:bg-orange-50">
          {project.project_image ? (
            <img
              src={project.project_image}
              alt={project.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
              이미지 없음
            </div>
          )}
        </div>
        <div className="flex h-full flex-col gap-3 p-4">
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-zinc-500">
            {project.failure_category?.slice(0, 3).map((category) => (
              <span
                key={category}
                className="rounded-full bg-zinc-100 px-2 py-0.5"
              >
                #{category}
              </span>
            ))}
          </div>
          <h3 className="text-lg font-bold text-zinc-900 line-clamp-2 group-hover:text-orange-500">
            {project.name}
          </h3>
          <p className="text-xs text-zinc-400">
            {project.user} • {project.period}
          </p>
          <div className="mt-auto flex items-center justify-between text-sm font-semibold">
            <span
              className={
                isFree
                  ? "text-green-600"
                  : isPaid
                    ? "text-orange-600"
                    : "text-zinc-400"
              }
            >
              {priceLabel}
            </span>
            {project.nickname ? (
              <span className="text-zinc-500">@{project.nickname}</span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}

function UserResultCard({
  user,
  bio,
}: {
  user: SearchUserResult;
  bio?: string | null;
}) {
  const displayName = user.nickname || user.name || "알 수 없는 사용자";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <article className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-orange-100 bg-zinc-50">
          {user.profile_image ? (
            <img
              src={user.profile_image}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-orange-500">
              {initial}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-zinc-900">{displayName}</h3>
          <p className="mt-3 text-sm text-zinc-500 line-clamp-3">
            {bio?.trim() || "자기소개가 아직 없습니다."}
          </p>
        </div>
      </div>
    </article>
  );
}
