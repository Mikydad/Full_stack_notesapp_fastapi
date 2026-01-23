import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getNotesByCategory, createNote } from "../api/notes";
import type { Note } from "../api/notes";
import { updateCategory as updateCategoryAPI, getCategories } from "../api/categories";
import NoteCard from "./NoteCard";
import { Edit2, Check, X, ArrowLeft } from "lucide-react";

interface CategoryDetailProps {
  onUpdateCategory?: (categoryId: string, newName: string) => void;
}

const CategoryDetail = ({ 
  onUpdateCategory 
}: CategoryDetailProps) => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, loading: authLoading } = useAuth(); // ✅ Get authLoading
  const [isEditing, setIsEditing] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editName, setEditName] = useState("");
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDescription, setNoteDescription] = useState("");

  // Fetch category name and notes
  useEffect(() => {
    // ✅ Wait for auth to load AND token to exist
    if (!authLoading && categoryId && token) {
      loadData();
    } else if (!authLoading && !token) {
      setError("Please login to view category");
      setLoading(false);
    }
  }, [categoryId, token, authLoading]);
 
  const loadData = async () => {
    if (!token || !categoryId) {
      setError("Missing authentication or category ID");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      // ✅ Try to get category name from navigation state first
      const state = location.state as { categoryName?: string } | null;
      if (state?.categoryName) {
        setCategoryName(state.categoryName);
        setEditName(state.categoryName);
      } else {
        // ✅ If not in state (page refresh), fetch from API
        try {
          const categories = await getCategories(token);
          const category = categories.find(cat => cat.id === categoryId);
          if (category) {
            setCategoryName(category.name);
            setEditName(category.name);
          } else {
            setError("Category not found");
            setLoading(false);
            return;
          }
        } catch (catErr) {
          console.error("Error fetching category:", catErr);
          setError(catErr instanceof Error ? catErr.message : "Failed to load category");
          setLoading(false);
          return;
        }
      }
      
      // Fetch notes for this category
      try {
        const notesData = await getNotesByCategory(token, categoryId);
        // ✅ Ensure notesData is an array
        setNotes(Array.isArray(notesData) ? notesData : []);
      } catch (notesErr) {
        console.error("Error fetching notes:", notesErr);
        // Don't set error for notes, just log it and show empty state
        setNotes([]);
      }
    } catch (err) {
      console.error("Load data error:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditName(categoryName);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!token || !categoryId || !editName.trim() || editName === categoryName) {
      setIsEditing(false);
      return;
    }

    setError("");
    try {
      await updateCategoryAPI(token, categoryId, { name: editName.trim() });
      setCategoryName(editName.trim());
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update category");
    }
  };

  const handleAddNote = async () => {
    if (!token || !categoryId || !noteTitle.trim() || !noteDescription.trim()) return;

    setError("");
    try {
      await createNote(token, {
        note_title: noteTitle.trim(),
        note_desc: noteDescription.trim(),
        category_id: categoryId
      });
      setNoteTitle("");
      setNoteDescription("");
      setShowNoteForm(false);
      await loadData(); // Refresh notes
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create note");
    }
  };

  // ✅ Show loading while auth or data is loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-gray-600">Loading category...</div>
      </div>
    );
  }

  // ✅ Handle missing categoryId
  if (!categoryId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/category')}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Categories</span>
          </button>
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            Category ID is missing. Please go back and select a category.
          </div>
        </div>
      </div>
    );
  }

  // ✅ Show error if there's an error and no category name
  if (error && !categoryName) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
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
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/category')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Categories</span>
        </button>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Header Section with Editable Category Title */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            {isEditing ? (
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-4 py-2 text-2xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  disabled={!editName.trim()}
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-semibold text-gray-900">
                  {categoryName || "Loading..."}
                </h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Edit category name"
                >
                  <Edit2 className="w-5 h-5 text-gray-600" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Add Note Form */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {!showNoteForm ? (
            <button
              onClick={() => setShowNoteForm(true)}
              className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              + Add New Note
            </button>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Note Title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <textarea
                placeholder="Note Description"
                value={noteDescription}
                onChange={(e) => setNoteDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddNote}
                  disabled={!noteTitle.trim() || !noteDescription.trim()}
                  className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Create Note
                </button>
                <button
                  onClick={() => {
                    setShowNoteForm(false);
                    setNoteTitle("");
                    setNoteDescription("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notes Grid */}
        <div>
          {notes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-lg">No notes in this category yet.</p>
              <p className="text-gray-400 text-sm mt-2">Create a note to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  id={note.id}
                  title={note.note_title}
                  description={note.note_desc}
                  onClick={() => {
                    navigate(`/note/${note.id}`, {
                      state: {
                        title: note.note_title,
                        description: note.note_desc,
                        categoryId: categoryId,
                        categoryName: categoryName
                      }
                    });
                  }}
                />
              ))}
            </div>
          )}
        </div>
              
      </div>
    </div>
  );
};

export default CategoryDetail;