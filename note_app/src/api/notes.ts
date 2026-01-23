const API_BASE_URL = "http://localhost:8000";
export interface Note {
  id: string;
  note_title: string;  // ✅ Changed from 'title'
  note_desc: string;   // ✅ Changed from 'description'
  category_id: string | null;
}

// ✅ Match backend request format
export interface CreateNoteData {
  note_title: string;  // ✅ Changed from 'title'
  note_desc: string;   // ✅ Changed from 'description'
  category_id?: string | null;
}

export interface UpdateNoteData {
  note_title: string;  // ✅ Changed from 'title'
  note_desc: string;   // ✅ Changed from 'description'
  category_id?: string | null;
}

export async function createNote(token: string, data: CreateNoteData): Promise<Note> {
  const response = await fetch(`${API_BASE_URL}/notes/notes`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to create note" }));
    throw new Error(error.detail || "Failed to create note");
  }

  return response.json();
}

export async function getNotesByCategory(token: string, categoryId: string): Promise<Note[]> {
    const respone = await fetch(`${API_BASE_URL}/notes/notes/category/${categoryId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
    if (!respone.ok) {
        const error = await respone.json().catch(() => ({ detail: "Failed to get notes by category" }));
        throw new Error(error.detail || "Failed to get notes by category");
    }
    return respone.json();
}

export async function getSingleNote(token: string, noteId: string): Promise<Note> {
    const respone = await fetch(`${API_BASE_URL}/notes/notes/${noteId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
    if (!respone.ok) {
        const error = await respone.json().catch(() => ({ detail: "Failed to get single note" }));
        throw new Error(error.detail || "Failed to get single note");
    }
    return respone.json(); 
}