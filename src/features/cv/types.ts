import type { CvVariant } from "@/types/database";

export interface CreateCvVariantInput {
  name: string;
  filePath?: string | null;
  isDefault?: boolean;
}

export type CvVariantOption = Pick<CvVariant, "id" | "name" | "file_path" | "is_default">;
