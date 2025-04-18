"use client";
import { Suspense, useEffect, useState } from "react";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useSearchParams, useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import { SERVER } from "@/app/const";
import Nav from "@/app/nav";

// function to convert drink name to image file format
function toSnakeCase(str) {
    return str.toLowerCase().replace(/ /g, "-");
}

function DrinkDetails() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Read drink name and price from URL query params
    const drinkName = searchParams.get("name") || "Selected Drink";
    const drinkPrice = parseFloat(searchParams.get("price")) || 0;

    // Local state
    const [search, setSearch] = useState(""); // search bar input
    const [loading, setLoading] = useState(true);

    // Data fetched from backend
    const [modifications, setModifications] = useState([]);
    const [toppings, setToppings] = useState([]);

    // Selected options by user
    const [selectedIce, setSelectedIce] = useState("");
    const [selectedSugar, setSelectedSugar] = useState("");
    const [selectedMods, setSelectedMods] = useState([]);
    const [selectedTopping, setSelectedTopping] = useState(""); // (single topping, not used)
    const [selectedToppings, setSelectedToppings] = useState([]); // actual topping list used

    // Fetch toppings and modifications from server on component mount
    useEffect(() => {
        fetch(`${SERVER}/modifications`)
            .then((res) => res.json())
            .then((data) => {
                setModifications(data.modifications || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch modifications:", err);
                setLoading(false);
            });

        fetch(`${SERVER}/toppings`)
            .then((res) => res.json())
            .then((data) => {
                setToppings(data.toppings || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch toppings:", err);
                setLoading(false);
            });
    }, []);

    // Toggle selected topping in the checkbox list
    const handleToggleTopping = (topping) => {
        setSelectedToppings((prev) =>
            prev.includes(topping)
                ? prev.filter((item) => item !== topping)
                : [...prev, topping]
        );
    };

    // Calculate total price based on selected options
    const getTotalPrice = () => {
        // Start with the base drink price
        const basePrice = drinkPrice;
    
        // Calculate total price of all selected toppings
        const toppingPrice = selectedToppings.reduce((total, toppingName) => {
            // Find the full topping object by name
            const topping = toppings.find((t) => t.name === toppingName);
            
            // If topping is found, add its price to the total
            // If not found or has no price, default to 0
            return topping ? total + (topping.price || 0) : total;
        }, 0); // Initial total is 0
    
        // Return the sum of base and topping prices, formatted to 2 decimal places
        return (basePrice + toppingPrice).toFixed(2);
    };
    

    // Filter modifications and toppings by search input
    const filteredMods = modifications.filter((mod) =>
        mod.name?.toLowerCase().includes(search.toLowerCase())
    );

    const filteredToppings = toppings.filter((top) =>
        top.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen p-4 md:p-8 font-[telegraf]">
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
                        placeholder="Search modifications or toppings..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 flex-grow">
                {/* Drink Image */}
                <div className="w-full md:w-1/3 flex flex-col items-center">
                    <img
                        src={`/drink-images/${toSnakeCase(drinkName)}.png`}
                        alt={drinkName}
                        className="w-48 h-64 object-cover rounded-md shadow-md"
                    />

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 mt-6 w-full items-center">
                        <a href="/customer/cart" className="w-4/5">
                            <button className="w-full bg-gray-200 text-black text-lg font-bold rounded-md py-2 px-4 transition-all transform hover:scale-105 hover:bg-blue-500 hover:text-white">
                                Add to Cart ${getTotalPrice()}
                            </button>
                        </a>
                        <a href="/customer/menu" className="w-4/5">
                            <button className="w-full bg-gray-200 text-black text-lg font-bold rounded-md py-2 px-4 transition-all transform hover:scale-105 hover:bg-blue-500 hover:text-white">
                                Shop More
                            </button>
                        </a>
                        <a href="/customer/checkout" className="w-4/5">
                            <button className="w-full bg-gray-200 text-black text-lg font-bold rounded-md py-2 px-4 transition-all transform hover:scale-105 hover:bg-blue-500 hover:text-white">
                                Buy Now ${getTotalPrice()}
                            </button>
                        </a>
                    </div>
                </div>

                {/* Modifications */}
                <div className="w-full md:w-2/3 flex-grow space-y-6">
                    {/* Ice Level */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Ice Level:</h3>
                        <div className="grid w-[500px] grid-cols-4 gap-0">
                            {filteredMods
                                .filter((mod) => mod.name?.toLowerCase().includes("ice"))
                                .map((mod, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="iceLevel"
                                            value={mod.name}
                                            checked={selectedIce === mod.name}
                                            onClick={(e) => {
                                                if (selectedIce === mod.name) {
                                                    e.target.checked = false;
                                                    setSelectedIce("");
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

                    {/* Sugar Level */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Sugar Level:</h3>
                        <div className="grid w-[500px] grid-cols-4 gap-0">
                            {filteredMods
                                .filter((mod) => mod.name?.toLowerCase().includes("sugar"))
                                .map((mod, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="sugarLevel"
                                            value={mod.name}
                                            checked={selectedSugar === mod.name}
                                            onClick={(e) => {
                                                if (selectedSugar === mod.name) {
                                                    e.target.checked = false;
                                                    setSelectedSugar("");
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

                    {/* Toppings */}
                    <h3 className="text-lg font-semibold text-white mb-2">Toppings:</h3>
                    <div className="w-[500px] mb-4">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {filteredToppings.map((mod, idx) => (
                            <label
                                key={idx}
                                className="flex items-center justify-between px-3 py-2 rounded border border-gray-700"
                            >
                                <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    value={mod.name}
                                    checked={selectedToppings.includes(mod.name)}
                                    onChange={(e) => {
                                    const newToppings = [...selectedToppings];
                                    if (e.target.checked) {
                                        newToppings.push(mod.name);
                                    } else {
                                        const index = newToppings.indexOf(mod.name);
                                        if (index > -1) newToppings.splice(index, 1);
                                    }
                                    setSelectedToppings(newToppings);
                                    }}
                                    className="w-4 h-4"
                                />
                                <span className="text-[#EED9C4] text-lg">{mod.name}</span>
                                </div>
                                <span className="text-xs text-gray-400">${mod.price?.toFixed(2)}</span>
                            </label>
                            ))}
                        </div>
                        </div>
                </div>
            </div>
        </div>
    );
}

export default function DrinkDetailsPage() {
    return (
        <Suspense fallback={<div className="text-[#EED9C4] text-center">Loading...</div>}>
            <DrinkDetails />
        </Suspense>
    );
}

