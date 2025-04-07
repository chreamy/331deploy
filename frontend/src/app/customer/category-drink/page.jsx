"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { SERVER } from "@/app/const";
import Nav from "@/app/nav";

function toSnakeCase(str) {
    return str.toLowerCase().replace(/ /g, "-");
}

function CategoryContent() {
    const searchParams = useSearchParams();
    const category = searchParams.get("name");
    const router = useRouter();

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
                console.error("Fetch error:", err);
                setLoading(false);
            });
    }, [category]);

    // Filter functionality for searching
    const filteredDrinks = drinks.filter((drink) =>
        drink.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-700 p-4 md:p-8 font-[Roboto]">
            <Nav userRole="customer" />

            {/* Back Button */}
            <div className="mt-6">
                <IoArrowBackCircleOutline
                    className="text-3xl cursor-pointer text-[#EED9C4]"
                    onClick={() => router.back()}
                />
            </div>

            {/* Category Header */}
            <h2 className="text-3xl font-extrabold mt-0 mb-6 text-center text-[#EED9C4] drop-shadow-md">
                {category || "Drinks"}
            </h2>

            {/* Search Bar */}
            <div className="flex justify-center mb-6">
                <div className="relative w-full max-w-md text-black">
                    <FaSearch className="absolute top-2.5 left-3 text-black" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-[#C2A385] rounded-md 
                                   focus:outline-none focus:ring-2 focus:ring-[#EED9C4] bg-gray-100"
                    />
                </div>
            </div>

            {/* Loading or No Drinks Message */}
            {loading ? (
                <p className="text-center text-[#EED9C4] text-lg font-semibold">
                    Loading...
                </p>
            ) : filteredDrinks.length === 0 ? (
                <p className="text-center text-[#EED9C4] text-lg font-semibold">
                    No drinks found.
                </p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredDrinks.map((drink, index) => (
                        <a
                            key={index}
                            href={`/customer/modifications?name=${toSnakeCase(
                                drink.name
                            )}&price=${drink.price}`}
                        >
                            <div
                                className="border border-[#C2A385] rounded-2xl p-6 text-center 
                                            text-gray-900 bg-white shadow-lg 
                                            hover:scale-105 hover:shadow-2xl transition-transform hover:bg-[#EED9C4]"
                            >
                                {/* Drink Image */}
                                <div className="w-full h-48 flex justify-center items-center">
                                    <img
                                        src={`/drink-images/${toSnakeCase(
                                            drink.name
                                        )}.png`}
                                        alt={drink.name}
                                        className="max-w-full max-h-full object-contain rounded-md"
                                    />
                                </div>

                                {/* Drink Name and Price */}
                                <div className="flex justify-center items-center mt-2">
                                    <p className="text-xl font-semibold">
                                        {drink.name}
                                    </p>
                                    <p className="ml-4 text-lg font-medium text-black">
                                        ${drink.price.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function SelectedCategoryPage() {
    return (
        <Suspense
            fallback={
                <div className="text-[#EED9C4] text-center">Loading...</div>
            }
        >
            <CategoryContent />
        </Suspense>
    );
}
