import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";  // Add useLocation
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
  const location = useLocation();  // Add this line
  const [isEditing, setIsEditing] = useState(false);
  const [categoryName, setCategoryName] = useState("");
 
  const [editName, setEditName] = useState("");

  // Fetch category and notes when component mounts
  useEffect(() => {
    if (categoryId) {
      // Get category name from navigation state (passed from CategoryPage)
      const state = location.state as { categoryName?: string } | null;
      const nameFromState = state?.categoryName;
      
      console.log("Location state:", location.state); // Debug log
      console.log("Category name from state:", nameFromState); // Debug log
      
      if (nameFromState) {
        setCategoryName(nameFromState);
        setEditName(nameFromState);
      } else {
        // Fallback: TODO - Fetch from API if not in state
        setCategoryName("Category Name");
        setEditName("Category Name");
      }
      
      // TODO: Fetch notes from API
      setNotes([]);
    }
  }, [categoryId, location]);

  const handleSave = () => {
    if (categoryId && editName.trim() && editName !== categoryName) {
      onUpdateCategory?.(categoryId, editName.trim());
      setCategoryName(editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(categoryName);
    setIsEditing(false);
  };
  const [notes,setNotes] = useState<Array<{
    id: string;
    title: string;
    description: string;
  }>>([]);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDescription, setNoteDescription] = useState("");

  const handleAddNote = () => {
    if (noteTitle.trim() && noteDescription.trim()) {
      setNotes([...notes, { id: Date.now().toString(), title: noteTitle, description: noteDescription }]);
      setNoteTitle("");
      setNoteDescription("");
      setShowNoteForm(false);
    }
  };

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
                <h1 className="text-3xl font-semibold text-gray-900">{categoryName}</h1>
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

        {/* Add Note Section */}
        <div className="mb-6">
          {!showNoteForm ? (
            <button
              onClick={() => setShowNoteForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Note
            </button>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">Create New Note</h2>
                  <button
                    onClick={() => {
                      setShowNoteForm(false);
                      setNoteTitle("");
                      setNoteDescription("");
                    }}
                    className="p-1 hover:bg-gray-100 rounded transition"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Note Title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    autoFocus
                  />
                  <textarea
                    value={noteDescription}
                    onChange={(e) => setNoteDescription(e.target.value)}
                    placeholder="Note Description"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddNote}
                      disabled={!noteTitle.trim() || !noteDescription.trim()}
                      className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
                    >
                      Create Note
                    </button>
                    <button
                      onClick={() => {
                        setShowNoteForm(false);
                        setNoteTitle("");
                        setNoteDescription("");
                      }}
                      className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
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
                  title={note.title}
                  description={note.description}
                  onClick={() => {
                    navigate(`/note/${note.id}`, {
                      state: {
                        title: note.title,
                        description: note.description,
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