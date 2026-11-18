import React from "react";
import { cookies } from "next/headers";
import { getJobOffers } from "@/features/offers/actions";
import { getCvVariants } from "@/features/cv/actions";
import { getCategories } from "@/features/categories/actions";
import { DashboardClientView } from "@/features/dashboard/components/DashboardClientView";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const theme = cookieStore.get("jobseeker-theme")?.value || "zinc";
  const isCosmic = theme === "cosmic";

  const [offers, cvVariants, categories] = await Promise.all([
    getJobOffers(),
    getCvVariants(),
    getCategories(),
  ]);

  return (
    <DashboardClientView
      initialOffers={offers}
      cvVariants={cvVariants}
      initialCategories={categories}
      isCosmic={isCosmic}
    />
  );
}
