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
            {/* Welcome Message */}
            <div className="text-center mt-6 mb-6">
                <h1 className="text-4xl font-bold text-white">
                    Welcome to ShareTea
                </h1>
            </div>

            {/* Start Order Button */}
            <div className="text-center mb-8">
                <a href="/categories">
                <button className="text-4xl font-bold px-25 py-10 bg-green-500 text-white rounded-xl shadow-md 
                                hover:scale-105 hover:shadow-xl transition-transform">
                    Tap to Start Order
                </button>
            </a>
        </div>
        </div>
    );
}
