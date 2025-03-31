"use client";
import { useState } from "react";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useRouter } from "next/navigation"; // Import useRouter
import {
    FaHome,
    FaVolumeUp,
    FaShoppingCart,
    FaSearch,
    FaLanguage,
} from "react-icons/fa";

export default function SelectedCategoryPage() {
    const [search, setSearch] = useState("");
    const router = useRouter(); // Initialize router

    const drinks = [
        { name: "Classic Milk Tea", image: "/drink-images/classic-milk-tea.png" },
        { name: "Taro Milk Tea", image: "/drink-images/taro-milk-tea.png" },
        { name: "Matcha Latte", image: "/drink-images/matcha-latte.png" },
        { name: "Brown Sugar Boba", image: "/drink-images/brown-sugar-boba.png" },
        { name: "Passion Fruit Green Tea", image: "/drink-images/passion-fruit.png" },
        { name: "Strawberry Smoothie", image: "/drink-images/strawberry-smoothie.png",},
        { name: "Oolong Milk Tea", image: "/drink-images/oolong-milk-tea.png" },
        { name: "Mango Yakult", image: "/drink-images/mango-yakult.png" },
    ];
    const [filteredDrinks, setFilteredDrinks] = useState({});

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-700 p-4 md:p-8">
            {/* Back Button */}
            <div className="mt-6">
                <IoArrowBackCircleOutline className="text-3xl cursor-pointer" 
                onClick={() => router.back()} // Navigate back
                />
            </div>

            {/* Category Title */}
            <h2 className="text-2xl font-bold mt-6 mb-4 text-center text-white">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {drinks.map((drink, index) => (
                    <a key={index} href="/customer/modifications">
                        <div
                            className={`border border-gray-400 rounded-xl p-6 text-center 
                                        text-gray-900 bg-gradient-to-r from-white to-gray-200 shadow-md 
                                        hover:scale-105 hover:shadow-xl transition-transform ${
                                index === 2 ? "border-white-500" : ""
                            }`}
                        >
                            <div className="w-full h-40 flex justify-center items-center">
                                <img 
                                    src={drink.image} 
                                    alt={drink.name} 
                                    className="max-w-full max-h-full object-contain rounded-md"
                                />
                            </div>
                            <p className="mt-2">{drink.name}</p>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
