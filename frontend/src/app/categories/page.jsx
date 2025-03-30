"use client";
import { useState } from "react";

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
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-700 p-4 md:p-8">
            <h2 className="text-2xl font-bold mt-6 mb-4 text-center text-white">
                Select a Category
            </h2>

            {/* Drink Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {categories.map((drink, index) => (
                    <a href="/category" key={index}>
                        <div className="border border-gray-400 rounded-xl p-6 text-center 
                                       text-gray-900 bg-gradient-to-r from-white to-gray-200 shadow-md 
                                       hover:scale-105 hover:shadow-xl transition-transform">
                            {drink}
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
