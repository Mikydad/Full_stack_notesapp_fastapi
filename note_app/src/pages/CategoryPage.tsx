import { useState } from "react";
import { useNavigate } from "react-router-dom";  // Add this import
import CategoryCard from "@/components/CategoryCard";

const CategoryPage = () => {
    const navigate = useNavigate();  // Add navigate hook
    const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [categoryName, setCategoryName] = useState("");

    const handleButtonClick = () => {
        setShowForm(!showForm);
        if(showForm) {
            setCategoryName("");
        }
    }

    const handleSubmit = () => {
        setCategories([...categories, {
            id: Date.now().toString(),
            name: categoryName
        }]);
        setShowForm(false);
        setCategoryName("");
    }

    // Add handler for card click
    const handleCardClick = (categoryId: string, categoryName: string) => {
        navigate(`/category/${categoryId}`, {
            state: { categoryName }
        });
    };

    return (
       <div className="main min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
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
                                onClick={() => handleCardClick(item.id, item.name)}  // Pass both id and name
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