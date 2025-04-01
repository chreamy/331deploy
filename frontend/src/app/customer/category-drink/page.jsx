"use client";
import { useEffect, useState } from "react";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useRouter, useSearchParams } from "next/navigation";
import {
    FaHome,
    FaVolumeUp,
    FaShoppingCart,
    FaSearch,
    FaLanguage,
} from "react-icons/fa";
import { SERVER } from "@/app/const";

// Converts "Classic Milk Tea" => "classic_milk_tea"
function toSnakeCase(str) {
    return str.toLowerCase().replace(/ /g, "-");
}

export default function SelectedCategoryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const category = searchParams.get("name");

    // Instantiate states
    const [search, setSearch] = useState("");
    const [drinks, setDrinks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch drinks from the server when a category is selected
    useEffect(() => {
        if (!category) return;

        fetch(`${SERVER}/categories`)
            .then((res) => res.json())
            .then((data) => {
                const drinksInCategory = data[category] || [];
                setDrinks(drinksInCategory);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching drinks:", err);
                setLoading(false);
            });
    }, [category]);

    // Filter functionality for searching
    const filteredDrinks = drinks.filter((drink) =>
        drink.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-700 p-4 md:p-8">
            {/* Back Button */}
            <div className="mt-6">
                <IoArrowBackCircleOutline
                    className="text-3xl cursor-pointer text-white"
                    onClick={() => router.back()}
                />
            </div>

            {/* Category Title */}
            <h2 className="text-2xl font-bold mt-6 mb-4 text-center text-white">
                {category || "Drinks"}
            </h2>

            {/* Search Bar */}
            <div className="flex justify-center mb-6">
                <div className="relative w-full max-w-md">
                    <FaSearch className="absolute top-2.5 left-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <p className="text-center text-white">Loading...</p>
            ) : filteredDrinks.length === 0 ? (
                <p className="text-center text-white">No drinks found.</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {filteredDrinks.map((drink, index) => (
                        <a key={index} href="/customer/modifications">
                            <div
                                className="border border-gray-400 rounded-xl p-6 text-center 
                                            text-gray-900 bg-gradient-to-r from-white to-gray-200 shadow-md 
                                            hover:scale-105 hover:shadow-xl transition-transform"
                            >
                                {/* Drink Image */}
                                <div className="w-full h-40 flex justify-center items-center">
                                    <img
                                        src={`/drink-images/${toSnakeCase(
                                            drink.name
                                        )}.png`}
                                        alt={drink.name}
                                        className="max-w-full max-h-full object-contain rounded-md"
                                    />
                                </div>
                                <p className="mt-2">{drink.name}</p>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
