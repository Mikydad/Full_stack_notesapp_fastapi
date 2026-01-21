import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Edit2 } from "lucide-react";
import { useState } from "react";

const NoteDetailPage = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  
  // Get note data from navigation state
  const state = location.state as { 
    title?: string; 
    description?: string;
    categoryId?: string;
    categoryName?: string;
  } | null;
  
  const [noteTitle, setNoteTitle] = useState(state?.title || "");
  const [noteDescription, setNoteDescription] = useState(state?.description || "");
  const [editTitle, setEditTitle] = useState(state?.title || "");
  const [editDescription, setEditDescription] = useState(state?.description || "");

  const handleSave = () => {
    if (editTitle.trim() && editDescription.trim()) {
      setNoteTitle(editTitle.trim());
      setNoteDescription(editDescription.trim());
      setIsEditing(false);
      // TODO: Update note via API
    }
  };

  const handleCancel = () => {
    setEditTitle(noteTitle);
    setEditDescription(noteDescription);
    setIsEditing(false);
  };

  const handleBack = () => {
    if (state?.categoryId) {
      navigate(`/category/${state.categoryId}`, {
        state: { categoryName: state.categoryName }
      });
    } else {
      navigate('/category');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to {state?.categoryName || "Category"}</span>
        </button>

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
                  disabled={!editTitle.trim() || !editDescription.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
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
