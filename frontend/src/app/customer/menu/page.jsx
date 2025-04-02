"use client";
import { SERVER } from "@/app/const";
import { useEffect, useState } from "react";
import Nav from "@/app/nav";

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
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-700 p-4 md:p-8 font-[Roboto]">
            <Nav userRole="customer" />
            {/* Category Header */}
            <h2 className="text-3xl font-extrabold mt-6 mb-6 text-center text-[#EED9C4] drop-shadow-md font-[Roboto]">
                Choose Your Bubble Tea!
            </h2>

            {/* Display loading message and the list of categories */}
            {loading ? (
                <div className="text-[#EED9C4] text-center text-lg font-semibold font-[Roboto]">Loading...</div>
            ) : (
                // <div className="grid grid-cols-3 gap-8">
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {categories.map((category, index) => (
                        <a
                            href={`/customer/category-drink?name=${encodeURIComponent(
                                category
                            )}`}
                            key={index}
                        >
                            <div
                                className="border border-[#C2A385] rounded-2xl p-8 text-center 
                                           text-gray-900 bg-white shadow-lg 
                                           hover:scale-105 hover:shadow-2xl transition-transform hover:bg-[#EED9C4] font-[Roboto]"
                            >
                                <span className="text-xl md:text-2xl font-semibold">{category}</span>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
