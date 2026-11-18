export interface JobCategory {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface CreateCategoryInput {
  name: string;
}

export interface UpdateCategoryInput {
  id: string;
  name: string;
}
