import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CategoryCard from "@/components/CategoryCard";
import { getCategories, createCategory } from "@/api/categories";
import type { Category } from "@/api/categories";
import { useAuth } from "../auth/AuthContext";

const CategoryPage = () => {
    const navigate = useNavigate();
    const { token, loading: authLoading } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [categoryName, setCategoryName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const handleButtonClick = () => {
        setShowForm(!showForm);
        if(showForm) {
            setCategoryName("");
        }
    }

    useEffect(() => {
        // Debug: Check token value
        console.log("Auth loading:", authLoading);
        console.log("Token:", token);
        console.log("Token from localStorage:", localStorage.getItem("token"));
        
        if (!authLoading && token) {
            loadCategories();
        } else if (!authLoading && !token) {
            setError("Please login to view categories");
            setLoading(false);
        }
    }, [token, authLoading]);

    const loadCategories = async () => {
        if (!token) {
            console.error("No token available for API call");
            return;
        }
        
        setLoading(true);
        setError("");

        try {
            console.log("Making API call with token:", token.substring(0, 20) + "..."); // Log first 20 chars
            const data = await getCategories(token);
            setCategories(data);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to load categories");
            console.error("API Error:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async () => {
        if (!token || !categoryName.trim()) return;
        setError("");
        try {
            await createCategory(token, { name: categoryName.trim() });
            setCategoryName("");
            setShowForm(false);
            await loadCategories();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to create category");
        }
    }

    const handleCardClick = (categoryId: string, categoryName: string) => {
        navigate(`/category/${categoryId}`, {
            state: { categoryName }
        });
    };

    // Show loading while auth is loading
    if (authLoading || loading) {
        return <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
            <div>Loading categories...</div>
        </div>;
    }

    return (
       <div className="main min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
            {/* Error message */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Header Section */}
            <div className="headers w-full flex justify-between items-center mb-6">
                <h1 className="text-3xl font-semibold text-gray-900">Categories</h1>
                <button 
                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm" 
                    onClick={handleButtonClick}
                >
                    {showForm ? "Cancel" : "Add Category"}
                </button>
            </div>

            {/* Form Section */}
            {showForm && (
                <div className="form-container mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="flex gap-2">
                        <input 
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
                            type="text" 
                            value={categoryName} 
                            onChange={(e) => setCategoryName(e.target.value)} 
                            placeholder="Enter category name"
                            autoFocus
                        />
                        <button 
                            onClick={handleSubmit}
                            disabled={!categoryName.trim()}
                            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
                        >
                            Create
                        </button>
                    </div>
                </div>
            )}

            {/* Categories List Section */}
            <div className="categories-list">
                {categories.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No categories yet. Create one to get started!</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map(item => (
                            <CategoryCard 
                                key={item.id} 
                                name={item.name} 
                                id={item.id}
                                onClick={() => handleCardClick(item.id, item.name)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
       </div>
    )
}

export default CategoryPage;