"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type NavbarProps = {
  isScrolled?: boolean;
  searchType?: "post" | "profile";
  setSearchType?: (type: "post" | "profile") => void;
};

export function Navbar({
  isScrolled = false,
  searchType: propSearchType,
  setSearchType: propSetSearchType,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isMain = pathname === "/";
  const showSearch = isMain ? isScrolled : true;

  // Internal state for when props are not provided
  const [internalSearchType, setInternalSearchType] = useState<
    "post" | "profile"
  >("post");
  const [searchQuery, setSearchQuery] = useState("");

  // Use props if available, otherwise internal state
  const searchType = propSearchType || internalSearchType;
  const setSearchType = propSetSearchType || setInternalSearchType;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      // TODO: Implement actual backend request here
      // const response = await fetch('/api/search', { ... });
      // const data = await response.json();

      // Mocking backend response handling by navigating to search page
      console.log(`Searching for ${searchQuery} in ${searchType}`);
      router.push(
        `/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`
      );
    } catch (error) {
      console.error("Search failed", error);
    }
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-zinc-100 bg-white/80 px-6 backdrop-blur-md transition-all">
      {/* Left: Logo */}
      <Link
        href="/"
        className="text-xl font-bold text-orange-500 transition-opacity hover:opacity-80"
      >
        Cistus
      </Link>

      {/* Center: Nav Search Bar (Visible only when scrolled) */}
      <div
        className={`flex flex-1 items-center justify-center gap-4 transition-all duration-500 ${
          showSearch
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <form onSubmit={handleSearch} className="w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchType === "post" ? "글 검색" : "프로필 검색"}
            className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm focus:border-orange-500 focus:outline-none"
          />
        </form>

        {/* Nav Toggle */}
        <div className="flex gap-3">
          <button
            onClick={() => setSearchType("post")}
            className={`text-sm font-bold transition-colors ${
              searchType === "post" ? "text-zinc-900" : "text-zinc-400"
            }`}
          >
            글
          </button>
          <button
            onClick={() => setSearchType("profile")}
            className={`text-sm font-bold transition-colors ${
              searchType === "profile" ? "text-zinc-900" : "text-zinc-400"
            }`}
          >
            프로필
          </button>
        </div>
      </div>

      {/* Right: Profile */}
      <div className="flex items-center gap-4">
        <Link
          href="/profile"
          className="h-8 w-8 overflow-hidden rounded-full bg-zinc-200 transition-all hover:ring-2 hover:ring-orange-500"
        >
          {/* Profile Image Placeholder */}
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
            U
          </div>
        </Link>
      </div>
    </nav>
  );
}
