import React from "react";
import { cookies } from "next/headers";
import { getCvVariants } from "@/features/cv/actions";
import { getCategories } from "@/features/categories/actions";
import { CvManagementClientView } from "@/features/cv/components/CvManagementClientView";

export default async function CvPage() {
  const cookieStore = await cookies();
  const theme = cookieStore.get("jobseeker-theme")?.value || "zinc";
  const isCosmic = theme === "cosmic";

  const [cvs, categories] = await Promise.all([
    getCvVariants(),
    getCategories(),
  ]);

  return (
    <CvManagementClientView
      initialVariants={cvs}
      initialCategories={categories}
      isCosmic={isCosmic}
    />
  );
}
