"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api, ApiResponse } from "../../lib/api";

type NavbarProps = {
  isScrolled?: boolean;
  searchType?: "post" | "profile";
  setSearchType?: (type: "post" | "profile") => void;
  searchQuery?: string;
  setSearchQuery?: (value: string) => void;
  onSearch?: (query: string, type: "post" | "profile") => void | Promise<void>;
};

export function Navbar({
  isScrolled = false,
  searchType: propSearchType,
  setSearchType: propSetSearchType,
  searchQuery: propSearchQuery,
  setSearchQuery: propSetSearchQuery,
  onSearch: propOnSearch,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isMain = pathname === "/";
  const showSearch = isMain ? isScrolled : true;

  // Internal state for when props are not provided
  const [internalSearchType, setInternalSearchType] = useState<
    "post" | "profile"
  >("post");
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Profile dropdown & Balance state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileInitial, setProfileInitial] = useState("U");
  const [profileName, setProfileName] = useState("User");
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  // Use props if available, otherwise internal state
  const searchType = propSearchType || internalSearchType;
  const setSearchType = propSetSearchType || setInternalSearchType;
  const searchQuery = propSearchQuery ?? internalSearchQuery;
  const setSearchQuery = propSetSearchQuery ?? setInternalSearchQuery;

  // Fetch user balance on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const meResponse = await api.get<
          ApiResponse<{ user: { user_id: number; name: string; nickname: string | null; money: number } }>
        >("/users/me");

        if (meResponse.success) {
          setBalance(meResponse.data.user.money);
          const userName = meResponse.data.user.nickname || meResponse.data.user.name;
          if (userName) {
            setProfileName(userName);
            setProfileInitial(userName.charAt(0).toUpperCase());
          }

          const detailResponse = await api.get<
            ApiResponse<{ user: { profile_image: string | null; name: string; nickname: string | null } }>
          >(`/users/${meResponse.data.user.user_id}`);

          if (detailResponse.success) {
            const imageUrl = detailResponse.data.user.profile_image;
            if (imageUrl) {
              setProfileImage(imageUrl);
            } else {
              const detailName =
                detailResponse.data.user.nickname ||
                detailResponse.data.user.name;
              if (detailName) {
                setProfileName(detailName);
                setProfileInitial(detailName.charAt(0).toUpperCase());
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch user info", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isProfileOpen &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      if (propOnSearch) {
        await propOnSearch(searchQuery, searchType);
      } else {
        router.push(
          `/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`
        );
      }
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
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <div className="absolute left-2 top-1/2 z-10 -translate-y-1/2">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-bold text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              <span>{searchType === "post" ? "글" : "프로필"}</span>
              <ChevronDownIcon
                className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-24 overflow-hidden rounded-xl border border-zinc-100 bg-white p-1 shadow-lg ring-1 ring-black/5">
                <button
                  type="button"
                  onClick={() => {
                    setSearchType("post");
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    searchType === "post"
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
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    searchType === "profile"
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
                ? "글 내용을 검색해보세요"
                : "프로필을 검색해보세요"
            }
            className="w-full rounded-full border border-zinc-200 bg-zinc-50 pl-24 pr-10 py-2 text-sm focus:border-orange-500 focus:outline-none transition-all"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-orange-500 transition-colors"
          >
            <SearchIcon className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Right: Profile */}
      <div className="relative flex items-center gap-3" ref={profileMenuRef}>
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center gap-3 rounded-full border border-zinc-100 bg-white/80 px-3 py-1.5 transition-all hover:border-orange-200 hover:bg-white focus:outline-none"
        >
          <div className="h-8 w-8 overflow-hidden rounded-full bg-zinc-200">
            {profileImage ? (
              <img
                src={profileImage}
                alt="프로필 이미지"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                {profileInitial}
              </div>
            )}
          </div>
          <div className="hidden lg:flex flex-col items-start text-left leading-tight">
            <span className="text-base font-bold text-zinc-800">
              {profileName}
            </span>
          </div>
        </button>

        {isProfileOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-zinc-100 bg-white p-1 shadow-lg ring-1 ring-black/5">
            <div className="px-3 py-2 text-sm font-bold text-zinc-900 border-b border-zinc-50 mb-1">
              내 포인트:{" "}
              <span className="text-orange-500">
                {balance?.toLocaleString() ?? 0} P
              </span>
            </div>
            <Link
              href="/profile"
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
              onClick={() => setIsProfileOpen(false)}
            >
              내 프로필
            </Link>
            <button
              onClick={() => {
                setIsProfileOpen(false);
                localStorage.removeItem("accessToken");
                window.location.href = "/login";
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
    </nav>
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
