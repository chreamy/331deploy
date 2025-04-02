"use client";
import { Suspense, useEffect, useState } from "react";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useSearchParams, useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import Nav from "@/app/nav";

function toSnakeCase(str) {
    return str.toLowerCase().replace(/ /g, "-");
}

function DrinkDetails() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get drink name and price from URL
    const drinkName = searchParams.get("name") || "Selected Drink";
    const drinkPrice = parseFloat(searchParams.get("price")) || 0;

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
        // Add the base price of the drink to the total price
        const basePrice = drinkPrice;

        // Add the price of the selected modifications
        const totalModsPrice = modifications
            .filter((mod) => selectedMods.includes(mod.name))
            .reduce((acc, cur) => acc + cur.price, 0);

        // Return the total price including the base drink price and selected modifications
        return (basePrice + totalModsPrice).toFixed(2);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-700 p-4 md:p-8 font-[Roboto]">
            <Nav userRole="customer" />

            <div className="mt-6">
                <IoArrowBackCircleOutline
                    className="text-3xl text-[#EED9C4] cursor-pointer"
                    onClick={() => router.back()}
                />
            </div>

            <h2 className="text-3xl font-extrabold mt-0 mb-6 text-center text-[#EED9C4] drop-shadow-md font-[Roboto]">
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
            <div className="flex flex-col md:flex-row gap-6 flex-grow">
                {/* Drink Image */}
                <div className="w-full md:w-1/3 flex justify-center">
                    <img
                        src={`/drink-images/${toSnakeCase(drinkName)}.png`}
                        alt={drinkName}
                        className="w-48 h-64 object-cover rounded-md shadow-md"
                    />
                </div>

                {/* Modifications */}
                <div className="w-full md:w-2/3 flex-grow">
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
                                    className="flex items-center justify-between max-w-md"
                                >
                                    <div className="flex items-center gap-2 flex-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedMods.includes(
                                                mod.name
                                            )}
                                            onChange={() =>
                                                handleToggle(mod.name)
                                            }
                                            className="w-5 h-5"
                                        />
                                        <span className="text-[#EED9C4]">
                                            {mod.name}
                                        </span>
                                    </div>
                                    <span className="text-[#EED9C4] w-20 text-right">
                                        ${mod.price.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full md:w-full flex justify-center gap-6 mt-0">
                <a href="/customer/cart">
                    <button className="w-full md:w-auto bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600">
                        Add to Cart ${getTotalPrice()}
                    </button>
                </a>
                <a href="/customer/menu">
                    <button className="w-full md:w-auto bg-gray-200 text-black rounded-md py-2 px-4 hover:bg-gray-300">
                        Shop More
                    </button>
                </a>

                <a href="/customer/checkout">
                    <button className="w-full md:w-auto bg-green-500 text-white rounded-md py-2 px-4 hover:bg-green-600">
                        Buy Now ${getTotalPrice()}
                    </button>
                </a>
            </div>
        </div>
    );
}

export default function DrinkDetailsPage() {
    return (
        <Suspense
            fallback={
                <div className="text-[#EED9C4] text-center">Loading...</div>
            }
        >
            <DrinkDetails />
        </Suspense>
    );
}
