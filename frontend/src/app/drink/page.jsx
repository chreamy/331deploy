"use client";
import { useState } from "react";
import { FaHome, FaVolumeUp, FaShoppingCart, FaLanguage } from "react-icons/fa";
import { IoArrowBackCircleOutline } from "react-icons/io5";

export default function DrinkDetails() {
    const [search, setSearch] = useState("");
    const [selectedMods, setSelectedMods] = useState([]);
    const [modifications] = useState([
        { name: "Extra Boba", price: 0.5 },
        { name: "Less Ice", price: 0 },
        { name: "Add Cheese Foam", price: 1.0 },
        { name: "Oat Milk", price: 0.75 },
        { name: "Sugar-Free", price: 0 },
    ]);

    const handleToggle = (modName) => {
        setSelectedMods((prev) =>
            prev.includes(modName)
                ? prev.filter((m) => m !== modName)
                : [...prev, modName]
        );
    };

    const getTotalPrice = () => {
        return modifications
            .filter((mod) => selectedMods.includes(mod.name))
            .reduce((acc, cur) => acc + cur.price, 0)
            .toFixed(2);
    };

    return (
        <div className="min-h-screen bg-smoke-50 p-4 md:p-8">
            {/* Subheading */}
            <h2 className="text-xl font-medium mt-6 mb-4 text-center">
                Modifications
            </h2>

            {/* Search Bar */}
            <div className="flex justify-center mb-4">
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Search modifications..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute top-2.5 left-3 text-gray-400">
                        🔍
                    </span>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col md:flex-row gap-6">
                {/* Drink Photo */}
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
                                mod.name
                                    .toLowerCase()
                                    .includes(search.toLowerCase())
                            )
                            .map((mod, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedMods.includes(
                                            mod.name
                                        )}
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
                    <button className="w-full bg-blue-500 text-white rounded-md py-2 hover:bg-blue-600">
                        Add to Cart ${getTotalPrice()}
                    </button>
                    <button className="w-full bg-gray-200 text-black rounded-md py-2 hover:bg-gray-300">
                        Shop More
                    </button>
                    <button className="w-full bg-green-500 text-white rounded-md py-2 hover:bg-green-600">
                        Buy Now ${getTotalPrice()}
                    </button>
                </div>
            </div>

            {/* Back Button */}
            <div className="mt-6">
                <IoArrowBackCircleOutline className="text-3xl cursor-pointer" />
            </div>
        </div>
    );
}
