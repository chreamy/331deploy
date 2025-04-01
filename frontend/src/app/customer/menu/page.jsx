"use client";
import { SERVER } from "@/app/const";
import { useEffect, useState } from "react";

export default function BubbleTeaShop() {
    // State to store data that will be needed
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch categories from the PostgreSQL server
    useEffect(() => {
        fetch(`${SERVER}/categories`) 
            .then((res) => res.json()) // put server response as s JSON
            .then((data) => {
                const fetchedCategories = Object.keys(data); // extract category names
                setCategories(fetchedCategories); // update categories
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch categories:", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-700 p-4 md:p-8">
            {/* Category Header */}
            <h2 className="text-2xl font-bold mt-6 mb-4 text-center text-white">
                Select a Category
            </h2>

            {/* Display loading message and the list of categories */}
            {loading ? (
                <div className="text-white text-center">Loading...</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {categories.map((category, index) => (
                        <a
                            href={`/customer/category-drink?name=${encodeURIComponent(
                                category
                            )}`}
                            key={index}
                        >
                            <div
                                className="border border-gray-400 rounded-xl p-6 text-center 
                                           text-gray-900 bg-gradient-to-r from-white to-gray-200 shadow-md 
                                           hover:scale-105 hover:shadow-xl transition-transform"
                            >
                                {category}
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
