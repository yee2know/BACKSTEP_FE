"use client";

import { useState } from "react";
import { Navbar } from "../_components/Navbar";

// Mock Data Interface
interface SearchResult {
  id: number;
  title: string;
  description: string;
  type: "private" | "free" | "paid";
  imageColor: string;
}

// Mock Data
const MOCK_RESULTS: SearchResult[] = Array.from({ length: 20 }).map((_, i) => ({
  id: i,
  title: `검색 결과 예시 제목 ${i + 1}`,
  description: "이것은 검색 결과의 상세 내용입니다. 검색어와 관련된 내용을 보여줍니다.",
  type: i % 3 === 0 ? "free" : i % 3 === 1 ? "paid" : "private",
  imageColor: i % 2 === 0 ? "bg-orange-50" : "bg-blue-50",
}));

type FilterType = "all" | "private" | "free" | "paid";

export default function SearchPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchType, setSearchType] = useState<"post" | "profile">("post");

  // Filter Logic
  const filteredResults = MOCK_RESULTS.filter((item) => {
    if (filter === "all") return true;
    return item.type === filter;
  });

  const searchTerm = "React"; // Placeholder for now, ideally from searchParams

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Navigation Bar */}
      <Navbar
        isScrolled={true} // Always show search bar in search page
        searchType={searchType}
        setSearchType={setSearchType}
      />

      {/* Main Content */}
      <main className="pt-24 px-8 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-4 border-b border-zinc-100 pb-6">
          {/* Left: Search Result Text */}
          <div>
            <h1 className="text-2xl font-bold text-zinc-400">
              <span className="text-zinc-900">"{searchTerm}"</span> 검색결과
            </h1>
          </div>

          {/* Right: Filter Buttons */}
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
        </div>

        {/* Search Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-20">
          {filteredResults.map((result) => (
            <article
              key={result.id}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              {/* Image Placeholder */}
              <div className={`aspect-video w-full ${result.imageColor} transition-colors group-hover:opacity-90`}></div>

              {/* Content */}
              <div className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge type={result.type} />
                </div>
                <h3 className="mb-1 text-lg font-bold text-zinc-900 group-hover:text-orange-500 line-clamp-1">
                  {result.title}
                </h3>
                <p className="line-clamp-2 text-sm text-zinc-500">
                  {result.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        {filteredResults.length === 0 && (
          <div className="text-center py-20 text-zinc-400">
            검색 결과가 없습니다.
          </div>
        )}
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

function Badge({ type }: { type: "private" | "free" | "paid" }) {
  const styles = {
    private: "bg-zinc-100 text-zinc-600",
    free: "bg-green-100 text-green-600",
    paid: "bg-orange-100 text-orange-600",
  };

  const labels = {
    private: "비공개",
    free: "무료",
    paid: "유료",
  };

  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${styles[type]}`}>
      {labels[type]}
    </span>
  );
}
