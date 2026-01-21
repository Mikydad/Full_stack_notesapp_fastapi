const API_BASE_URL = "http://localhost:8000";

export interface Category {
  id: string;
  name: string;
}

export interface CreateCategoryData {
  name: string;
}

export interface UpdateCategoryData {
  name: string;
}

export async function getCategories(token: string): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/categories/categories`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to fetch categories" }));
    throw new Error(error.detail || "Failed to fetch categories");
  }

  return response.json();
}

export async function createCategory(token: string, data: CreateCategoryData): Promise<Category> {
  const response = await fetch(`${API_BASE_URL}/categories/categories`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to create category" }));
    throw new Error(error.detail || "Failed to create category");
  }

  return response.json();
}

export async function updateCategory(
  token: string,
  categoryId: string,
  data: UpdateCategoryData
): Promise<Category> {
  const response = await fetch(`${API_BASE_URL}/categories/categories/${categoryId}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to update category" }));
    throw new Error(error.detail || "Failed to update category");
  }

  return response.json();
}

export async function deleteCategory(token: string, categoryId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/categories/categories/${categoryId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to delete category" }));
    throw new Error(error.detail || "Failed to delete category");
  }
}


