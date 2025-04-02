"use client";
import { useEffect, useState } from "react";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useRouter } from "next/navigation"; // Import useRouter
import {
    FaHome,
    FaVolumeUp,
    FaShoppingCart,
    FaSearch,
    FaLanguage,
} from "react-icons/fa";
import Nav from "@/app/nav";

export default function DrinkDetails() {
    const router = useRouter(); // Initialize useRouter
    // instantiate states for data that wil be needed
    const [search, setSearch] = useState("");
    const [selectedMods, setSelectedMods] = useState([]);
    const [modifications] = useState([
        { name: "Extra Boba", price: 0.5 },
        { name: "Less Ice", price: 0 },
        { name: "Add Cheese Foam", price: 1.0 },
        { name: "Oat Milk", price: 0.75 },
        { name: "Sugar-Free", price: 0 },
    ]); // placeholder modofication values (Work in progress)

    // Function that toggles upon a modification selection
    const handleToggle = (modName) => {
        setSelectedMods((prev) =>
            prev.includes(modName)
                ? prev.filter((m) => m !== modName)
                : [...prev, modName]
        );
    };

    // Function to calcuate modification prices
    const getTotalPrice = () => {
        return modifications
            .filter((mod) => selectedMods.includes(mod.name))
            .reduce((acc, cur) => acc + cur.price, 0)
            .toFixed(2);
    };

    return (
        <div>
            <Nav userRole="customer" />
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-700 p-4 md:p-8">
                {/* Back Button */}
                <div className="mt-6">
                    <IoArrowBackCircleOutline className="text-3xl cursor-pointer" 
                    onClick={() => router.back()} // Navigate back
                    />
                </div>

                {/* Subheading */}
                <h2 className="text-2xl font-bold mt-6 mb-4 text-center">
                    Modifications
                </h2>

                {/* Search Bar */}
                <div className="flex justify-center mb-4">
                    <div className="relative w-full max-w-md">
                        <FaSearch className="absolute top-2.5 left-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search modifications..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                        />
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Placeholder for Drink Photo */}
                    <div className="w-full md:w-1/3 flex justify-center">
                        <div className="w-48 h-64 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                            &lt;Drink Photo&gt;
                        </div>
                    </div>

                    {/* Modifications */}
                    <div className="w-full md:w-2/3">
                        <div className="space-y-3">
                            {modifications
                                .filter((mod) =>
                                    mod.name.toLowerCase().includes(search.toLowerCase())
                                )
                                .map((mod, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedMods.includes(mod.name)}
                                            onChange={() => handleToggle(mod.name)}
                                            className="w-5 h-5"
                                        />
                                        <span className="flex-1">{mod.name}</span>
                                        <span>${mod.price.toFixed(2)}</span>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full md:w-1/4 space-y-4">
                        <a href="/customer/cart">
                            <button className="w-full bg-blue-500 text-white rounded-md py-2 my-1 hover:bg-blue-600">
                                Add to Cart
                            </button>
                        </a>
                        <a href="/customer/menu">
                            <button className="w-full bg-gray-200 text-black rounded-md py-2 my-1 hover:bg-gray-300">
                                Shop More
                            </button>
                        </a>

                        <a href="/customer/checkout"> 
                            <button className="w-full bg-green-500 text-white rounded-md py-2 my-1 hover:bg-green-600">
                                Buy Now ${getTotalPrice()}
                            </button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
