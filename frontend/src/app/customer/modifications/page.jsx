"use client";
import { useEffect, useState } from "react";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useSearchParams, useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import { SERVER } from "@/app/const";
import Nav from "@/app/nav";

function toSnakeCase(str) {
    return str.toLowerCase().replace(/ /g, "-");
}
export default function DrinkDetails() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Get drink name and price from URL
    const drinkName = searchParams.get("name") || "Selected Drink";
    const drinkPrice = parseFloat(searchParams.get("price")) || 0;

    // Instantiate states
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [modifications, setModifications] = useState([]);
    const [selectedIce, setSelectedIce] = useState("");
    const [selectedSugar, setSelectedSugar] = useState("");
    
    // Fetch modifications from the PostgreSQL server
    useEffect(() => {
        fetch(`${SERVER}/modifications`) 
            .then((res) => res.json()) // put server response as JSON
            .then((data) => {
                const fetchedModifications = data; // Directly use the data from the response
                setModifications(fetchedModifications); // Update the state
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch modifications:", err);
                setLoading(false);
            });
    }, []);
    
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
        
        // Since modifications don't have a price, we don't add any extra price here.
        return basePrice.toFixed(2);  // Only return the base price of the drink
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
                    <div className="space-y-6">
                        {/* Ice Level Row */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Ice Level:</h3>
                            <div className="grid grid-cols-4 gap-0">
                                {modifications
                                    .filter((mod) => mod.name && mod.name.toLowerCase().includes("ice"))
                                    .map((mod, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="iceLevel" // Ensures only one selection in this group
                                                value={mod.name}
                                                checked={selectedIce === mod.name}
                                                onClick={(e) => {
                                                    if (selectedIce === mod.name) {
                                                        e.target.checked = false; // Uncheck if the same option is clicked
                                                        setSelectedIce(""); // Clear selection
                                                    }
                                                }}
                                                onChange={() => setSelectedIce(mod.name)}
                                                className="w-5 h-5"
                                            />
                                            <span className="text-[#EED9C4] text-lg">{mod.name}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Sugar Level Row */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Sugar Level:</h3>
                            <div className="grid grid-cols-4 gap-0">
                                {modifications
                                    .filter((mod) => mod.name && mod.name.toLowerCase().includes("sugar"))
                                    .map((mod, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="sugarLevel" // Ensures only one selection in this group
                                                value={mod.name}
                                                checked={selectedSugar === mod.name}
                                                onClick={(e) => {
                                                    if (selectedSugar === mod.name) {
                                                        e.target.checked = false; // Uncheck if the same option is clicked
                                                        setSelectedSugar(""); // Clear selection
                                                    }
                                                }}
                                                onChange={() => setSelectedSugar(mod.name)}
                                                className="w-5 h-5"
                                            />
                                            <span className="text-[#EED9C4] text-lg">{mod.name}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
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
