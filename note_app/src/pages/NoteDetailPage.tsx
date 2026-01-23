import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { updateNote, getSingleNote } from "../api/notes";

const NoteDetailPage = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, loading: authLoading, setAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  
  // Get note data from navigation state
  const state = location.state as { 
    title?: string; 
    description?: string;
    categoryId?: string;
    categoryName?: string;
  } | null;
  
  const [noteTitle, setNoteTitle] = useState(state?.title || "");
  const [noteDescription, setNoteDescription] = useState(state?.description || "");
  const [categoryId, setCategoryId] = useState(state?.categoryId || "");
  const [categoryName, setCategoryName] = useState(state?.categoryName || "");
  const [editTitle, setEditTitle] = useState(state?.title || "");
  const [editDescription, setEditDescription] = useState(state?.description || "");

  // Always fetch note data from API on mount/refresh to ensure fresh data
  useEffect(() => {
    if (!authLoading && noteId && token) {
      // Use state for initial optimistic display if available, but always fetch from API
      if (state?.title && state?.description) {
        setNoteTitle(state.title);
        setNoteDescription(state.description);
        setCategoryId(state.categoryId || "");
        setCategoryName(state.categoryName || "");
        setEditTitle(state.title);
        setEditDescription(state.description);
        // Still fetch from API to ensure we have the latest data
        loadNoteData();
      } else {
        // No state data (page refresh), fetch from API
        loadNoteData();
      }
    } else if (!authLoading && !token) {
      setError("Please login to view note");
      setLoading(false);
    }
  }, [noteId, token, authLoading]);

  const loadNoteData = async () => {
    if (!token || !noteId) return;
    
    setLoading(true);
    setError("");
    try {
      const note = await getSingleNote(token, noteId);
      setNoteTitle(note.note_title);
      setNoteDescription(note.note_desc);
      setCategoryId(note.category_id || "");
      setEditTitle(note.note_title);
      setEditDescription(note.note_desc);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load note";
      setError(errorMessage);
      console.error("Load note error:", err);
      
      // If token expired, the API call will handle redirect
      // But we should also clear local state
      if (errorMessage.includes("Session expired") || errorMessage.includes("Invalid token")) {
        // Clear token from context
        setAuth(null, null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token || !noteId || !editTitle.trim() || !editDescription.trim()) return;

    setSaving(true);
    setError("");
    try {
      await updateNote(token, noteId, {
        note_title: editTitle.trim(),
        note_desc: editDescription.trim(),
        category_id: categoryId || null
      });
      
      // Refetch note data to ensure we have the latest from backend
      const updatedNote = await getSingleNote(token, noteId);
      setNoteTitle(updatedNote.note_title);
      setNoteDescription(updatedNote.note_desc);
      setEditTitle(updatedNote.note_title);
      setEditDescription(updatedNote.note_desc);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update note");
      console.error("Update note error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(noteTitle);
    setEditDescription(noteDescription);
    setIsEditing(false);
  };

  const handleBack = () => {
    if (categoryId) {
      navigate(`/category/${categoryId}`, {
        state: { categoryName: categoryName }
      });
    } else {
      navigate('/category');
    }
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-gray-600">Loading note...</div>
      </div>
    );
  }

  // Show error state
  if (error && !noteTitle) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/category')}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Categories</span>
          </button>
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to {categoryName || "Category"}</span>
        </button>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Note Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {isEditing ? (
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-3 text-3xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Note Title"
                autoFocus
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={15}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none text-gray-700"
                placeholder="Note Description"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={!editTitle.trim() || !editDescription.trim() || saving}
                  className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-semibold text-gray-900">{noteTitle || "Untitled Note"}</h1>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditTitle(noteTitle);
                    setEditDescription(noteDescription);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Edit note"
                >
                  <Edit2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {noteDescription || "No description available."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteDetailPage;
