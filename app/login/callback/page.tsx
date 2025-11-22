"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("로그인 정보를 확인하고 있어요...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("토큰 정보가 없어요. 다시 로그인해주세요.");
      return;
    }

    try {
      localStorage.setItem("cistus_token", token);
      setStatus("로그인에 성공했어요! 잠시 후 메인 페이지로 이동합니다.");

      const timer = setTimeout(() => {
        router.replace("/");
      }, 1200);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error(error);
      setStatus("토큰 저장 중 오류가 발생했어요.");
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
      <p className="text-lg font-semibold text-zinc-700">{status}</p>
    </div>
  );
}

