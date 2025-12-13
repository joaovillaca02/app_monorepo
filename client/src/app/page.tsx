"use client";

import { useQuery } from "@tanstack/react-query";
import { ModeToggle } from "@/components/mode-toggle";

const fetchMessage = async () => {
  const res = await fetch("http://localhost:8000/");
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};

export default function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["homeMessage"],
    queryFn: fetchMessage,
  });

  return (
    <div className="w-full">
      <div className="flex justify-end p-4">
        <ModeToggle />
      </div>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
          Django + Next.js
        </h1>
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-xl">
          Backend says:{" "}
          <span className="font-semibold text-primary">
            {isLoading
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
