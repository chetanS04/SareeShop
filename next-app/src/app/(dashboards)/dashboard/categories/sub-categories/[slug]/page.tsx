"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SubCategoriesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/categories");
  }, [router]);

  return (
    <div className="p-8 text-center text-sm text-gray-500">
      Redirecting to Categories...
    </div>
  );
}