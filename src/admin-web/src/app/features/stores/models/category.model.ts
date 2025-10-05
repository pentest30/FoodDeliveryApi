export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface CategoryDto {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface CreateCategoryRequest {
  externalId?: string;
  name: string;
  icon: string;
  color: string;
}

export interface UpdateCategoryRequest {
  name: string;
  icon: string;
  color: string;
}

export interface CategoryListResponse {
  items: CategoryDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}


