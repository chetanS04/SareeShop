"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function SubcategoriesRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug || params?.id || "") as string;

  useEffect(() => {
    if (slug) {
      router.replace(`/categories/${slug}`);
    } else {
      router.replace("/categories");
    }
  }, [slug, router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-border-line border-t-primary animate-spin" />
    </div>
  );
}
