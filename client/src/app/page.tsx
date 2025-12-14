"use client";

import { useQuery } from "@tanstack/react-query";
import { ModeToggle } from "@/components/mode-toggle";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const fetchMessage = async () => {
  const res = await fetch("http://localhost:8000/", {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();

  const { data, isLoading: isQueryLoading, error } = useQuery({
    queryKey: ["homeMessage"],
    queryFn: fetchMessage,
    enabled: isAuthenticated, // Só busca se estiver autenticado
  });

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  if (isAuthLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex justify-end p-4">
        <ModeToggle />
      </div>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
          Django + Next.js
        </h1>
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-xl mb-4">
          Bem-vindo, <span className="font-semibold text-primary">{user?.username}</span>!
        </p>
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-xl">
          Backend says:{" "}
          <span className="font-semibold text-primary">
            {isQueryLoading
              ? "Loading..."
              : error
                ? "Error fetching data"
                : data?.message}
          </span>
        </p>
      </div>
    </div>
  );
}
