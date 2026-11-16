import React from "react";
import { cookies } from "next/headers";
import { getJobOffers } from "@/features/offers/actions";
import { getCvVariants } from "@/features/cv/actions";
import { getCategories } from "@/features/categories/actions";
import { DashboardClientView } from "@/features/dashboard/components/DashboardClientView";
import type { JobOffer, CvVariant } from "@/types/database";

// Domyślne dane demonstracyjne prezentujące możliwości systemu przed podpięciem bazy Supabase
const FALLBACK_OFFERS: JobOffer[] = [
  {
    id: "demo-1",
    user_id: "demo-user",
    cv_variant_id: "cv-1",
    title: "Junior Python Developer",
    category: "IT / Software",
    company_name: "TechCraft Solutions",
    company_address: "Warszawa (Hybryda)",
    contact_phone: "+48 501 234 567",
    contact_email: "rekrutacja@techcraft.pl",
    source_url: "https://nofluffjobs.com",
    is_cv_sent: true,
    status: "interview",
    work_mode: "hybrid",
    salary_range: "8 000 - 10 000 PLN B2B",
    requirements: "- Python 3.11+, FastAPI / Django\n- Podstawy PostgreSQL i Docker\n- Git, testy jednostkowe pytest",
    notes: "Rozmowa techniczna zaplanowana na czwartek godz. 14:00.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    cv_variants: { id: "cv-1", name: "CV Python B2B", file_path: null },
  },
  {
    id: "demo-2",
    user_id: "demo-user",
    cv_variant_id: "cv-2",
    title: "Pomocnik Stolarza / Montażysta",
    category: "Stolarstwo / Meble",
    company_name: "DrewnoStyl Meble",
    company_address: "Pruszków (Warsztat)",
    contact_phone: "+48 600 987 654",
    contact_email: "biuro@drewnostyl.pl",
    source_url: "https://olx.pl",
    is_cv_sent: false,
    status: "saved",
    work_mode: "onsite",
    salary_range: "35 - 45 PLN / godz.",
    requirements: "Obsługa elektronarzędzi, montaż mebli na wymiar u klienta.",
    notes: "Kontaktować się bezpośrednio z majstrem p. Krzysztofem.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    cv_variants: { id: "cv-2", name: "CV Stolarstwo PL", file_path: null },
  },
  {
    id: "demo-3",
    user_id: "demo-user",
    cv_variant_id: "cv-3",
    title: "Detailer Samochodowy (Polerowanie)",
    category: "Car Detailing / Auto",
    company_name: "AutoShine Studio",
    company_address: "Warszawa Mokotów",
    contact_phone: "+48 720 112 233",
    contact_email: "kontakt@autoshine.pl",
    source_url: "https://olx.pl",
    is_cv_sent: true,
    status: "contacted",
    work_mode: "onsite",
    salary_range: "6 000 - 8 000 PLN netto",
    requirements: "Korekta lakieru, nakładanie powłok ceramicznych, pranie tapicerki.",
    notes: "Rekruter dzwonił w sprawie próbnego elementu lakierniczego.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    cv_variants: { id: "cv-3", name: "CV Detailing", file_path: null },
  },
];

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

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const theme = cookieStore.get("jobseeker-theme")?.value || "zinc";
  const isCosmic = theme === "cosmic";

  // Próba pobrania danych z Supabase; w razie braku połączenia używamy danych demonstracyjnych
  const [dbOffers, dbCvs, dbCategories] = await Promise.all([
    getJobOffers(),
    getCvVariants(),
    getCategories(),
  ]);

  const offers = dbOffers.length > 0 ? dbOffers : FALLBACK_OFFERS;
  const cvVariants = dbCvs.length > 0 ? dbCvs : FALLBACK_CVS;

  return (
    <DashboardClientView
      initialOffers={offers}
      cvVariants={cvVariants}
      initialCategories={dbCategories}
      isCosmic={isCosmic}
    />
  );
}
