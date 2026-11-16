export interface JobCategory {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export const DEFAULT_CATEGORIES = [
  "IT / Software",
  "Stolarstwo / Meble",
  "Car Detailing / Auto",
  "Marketing / Copywriting",
  "Handel / Sprzedaż",
  "Inne",
];

export interface CreateCategoryInput {
  name: string;
}

export interface UpdateCategoryInput {
  id: string;
  name: string;
}
