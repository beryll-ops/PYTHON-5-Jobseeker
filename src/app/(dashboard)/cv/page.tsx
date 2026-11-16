import React from "react";
import { cookies } from "next/headers";
import { getCvVariants } from "@/features/cv/actions";
import { getCategories } from "@/features/categories/actions";
import { CvManagementClientView } from "@/features/cv/components/CvManagementClientView";
import type { CvVariant } from "@/types/database";

const FALLBACK_CVS: CvVariant[] = [
  {
    id: "cv-1",
    user_id: "demo-user",
    name: "CV Python B2B",
    file_path: null,
    is_default: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "cv-2",
    user_id: "demo-user",
    name: "CV Stolarstwo PL",
    file_path: null,
    is_default: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "cv-3",
    user_id: "demo-user",
    name: "CV Detailing",
    file_path: null,
    is_default: false,
    created_at: new Date().toISOString(),
  },
];

export default async function CvPage() {
  const cookieStore = await cookies();
  const theme = cookieStore.get("jobseeker-theme")?.value || "zinc";
  const isCosmic = theme === "cosmic";

  const [dbCvs, dbCategories] = await Promise.all([
    getCvVariants(),
    getCategories(),
  ]);

  const cvs = dbCvs.length > 0 ? dbCvs : FALLBACK_CVS;

  return (
    <CvManagementClientView
      initialVariants={cvs}
      initialCategories={dbCategories}
      isCosmic={isCosmic}
    />
  );
}
