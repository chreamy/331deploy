"use client";
import { useState } from "react";
import {
    FaHome,
    FaVolumeUp,
    FaShoppingCart,
    FaSearch,
    FaLanguage,
} from "react-icons/fa";

export default function BubbleTeaShop() {
    const [search, setSearch] = useState("");
    const categories = [
        "Milk Tea",
        "Fruit Tea",
        "Smoothies",
        "Cheese Foam",
        "Yakult Series",
        "Toppings",
        "Iced Blends",
        "Seasonal Specials",
    ];

    return (
        <div className="min-h-screen bg-smoke-50 p-4 md:p-8">
            <h2 className="text-xl font-medium mt-6 mb-2 text-center">
                Select a Category
            </h2>

            {/* Drink Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((drink, index) => (
                    <a href="/category" key={index}>
                        <div className="border rounded-md p-8 text-center text-gray-500">
                            {drink}
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
