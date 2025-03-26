"use client";
import { useState } from "react";
import {
    FaHome,
    FaVolumeUp,
    FaShoppingCart,
    FaSearch,
    FaLanguage,
} from "react-icons/fa";

export default function SelectedCategoryPage() {
    const [search, setSearch] = useState("");
    const drinks = [
        { name: "Classic Milk Tea", image: "/images/classic-milk-tea.png" },
        { name: "Taro Milk Tea", image: "/images/taro-milk-tea.png" },
        { name: "Matcha Latte", image: "/images/matcha-latte.png" },
        { name: "Brown Sugar Boba", image: "/images/brown-sugar-boba.png" },
        { name: "Passion Fruit Green Tea", image: "/images/passion-fruit.png" },
        {
            name: "Strawberry Smoothie",
            image: "/images/strawberry-smoothie.png",
        },
        { name: "Oolong Milk Tea", image: "/images/oolong-milk-tea.png" },
        { name: "Mango Yakult", image: "/images/mango-yakult.png" },
    ];
    const [filteredDrinks, setFilteredDrinks] = useState({});

    return (
        <div className="min-h-screen bg-smoke-50 p-4 md:p-8">
            {/* Category Title */}
            <h2 className="text-xl font-medium mt-6 mb-2 text-center">
                Drinks
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

            {/* Drink Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {drinks.map((drink, index) => (
                    <a key={index} href="/drink">
                        <div
                            className={`border rounded-md p-8 flex flex-col justify-center text-center text-gray-500 ${
                                index === 2 ? "border-purple-500" : ""
                            }`}
                        >
                            <img src="/drink.png" /> {drink.name}
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
