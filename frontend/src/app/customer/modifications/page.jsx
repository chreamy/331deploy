"use client";
import { Suspense, useEffect, useState } from "react";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useSearchParams, useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import { SERVER } from "@/app/const";
import Nav from "@/app/nav";
import VoiceLayer from "@/app/components/VoiceLayer";
import VoiceElement from "@/app/components/VoiceElement";
import HighContrastWrapper from "@/app/components/HighContrastWrapper";
import { useHighContrast } from "@/app/components/HighContrastContext";

function toSnakeCase(str) {
    return str.toLowerCase().replace(/ /g, "-");
}

function formatDrinkName(str) {
    return str.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function DrinkDetailsContent({ drinkName, drinkPrice }) {
    const router = useRouter();
    const { highContrast } = useHighContrast();

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [modifications, setModifications] = useState([]);
    const [toppings, setToppings] = useState([]);
    const [selectedSize, setSelectedSize] = useState("Medium"); // Default to Medium
    const [selectedIce, setSelectedIce] = useState("Full Ice"); // Default to Full Ice
    const [selectedSugar, setSelectedSugar] = useState("100% Sugar"); // Default to 100% Sugar
    const [selectedToppings, setSelectedToppings] = useState([]);

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

    const handleToggleTopping = (topping) => {
        setSelectedToppings((prev) =>
            prev.includes(topping) ? prev.filter((item) => item !== topping) : [...prev, topping]
        );
    };

    const getTotalPrice = () => {
        const toppingPrice = selectedToppings.reduce((total, toppingName) => {
            const topping = toppings.find((t) => t.name === toppingName);
            return topping ? total + (topping.price || 0) : total;
        }, 0);
        return (drinkPrice + toppingPrice).toFixed(2);
    };

    const filteredMods = modifications.filter((mod) => mod.name?.toLowerCase().includes(search.toLowerCase()));
    const filteredToppings = toppings.filter((top) => top.name?.toLowerCase().includes(search.toLowerCase()));

    const addToCart = () => {
        const selectedToppingObjects = selectedToppings.length > 0
            ? toppings.filter((top) => selectedToppings.includes(top.name)).map((top) => ({
                name: top.name,
                price: top.price || 0,
            }))
            : [];

        const cartItem = {
            drinkName,
            drinkPrice,
            selectedSize: selectedSize || "Medium", // Default to Medium if not selected
            selectedIce: selectedIce || "Full Ice", // Default to Full Ice if not selected
            selectedSugar: selectedSugar || "100% Sugar", // Default to 100% Sugar if not selected
            selectedToppings: selectedToppingObjects,
            quantity: 1,
            totalPrice: getTotalPrice(),
        };

        const currentCart = JSON.parse(localStorage.getItem("cart")) || [];
        currentCart.push(cartItem);
        localStorage.setItem("cart", JSON.stringify(currentCart));
    };

    const handleBack = () => router.back();
    const handleAddToCart = () => { addToCart(); router.push("/customer/cart"); };
    const handleShopMore = () => { addToCart(); router.push("/customer/menu"); };
    const handleBuyNow = () => { addToCart(); router.push("/customer/checkout"); };

    return (
        <HighContrastWrapper>
            <VoiceLayer>
                <div className="min-h-screen p-4 md:p-8 font-[telegraf]" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
                    <Nav userRole="customer" />

                    <div className="mt-6">
                        <VoiceElement id="back-button" description="Go back" onClick={handleBack}>
                            <IoArrowBackCircleOutline className={`text-3xl cursor-pointer ${highContrast ? "text-yellow-300" : "text-[#EED9C4]"}`} />
                        </VoiceElement>
                    </div>
                    
                    <h2 className="text-3xl font-extrabold mt-0 mb-6 text-center drop-shadow-md">
                        Modifications
                    </h2>

                    <div className="relative mb-6">
                        <div className="flex justify-center mb-4">
                            <div className="relative w-full max-w-md">
                                <FaSearch
                                    className="absolute top-2.5 left-3"
                                    style={{
                                        color: highContrast ? "var(--foreground)" : "black",
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Search modifications or toppings..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                                        highContrast
                                            ? ""
                                            : "bg-gray-100 text-black border-[#C2A385]"
                                    }`}
                                    style={{
                                        backgroundColor: highContrast ? "var(--card-bg)" : "#F3F4F6", // bg-gray-100
                                        borderColor: highContrast ? "var(--border-color)" : "#C2A385",
                                        color: highContrast ? "var(--foreground)" : "#000000",
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 flex-grow">
                        {/* Drink Image and Action Buttons */}
                        <div className="w-full md:w-1/3 flex flex-col items-center">
                            <h3 className="text-3xl font-extrabold mt-0 mb-6 text-center drop-shadow-md">
                                {formatDrinkName(drinkName)}
                            </h3>
                            <img
                                src={`/drink-images/${toSnakeCase(drinkName)}.png`}
                                alt={drinkName}
                                className="w-48 h-64 object-cover rounded-md shadow-md"
                            />

                            <div className="flex flex-col gap-2 mt-6 w-full items-center">
                                <VoiceElement id="add-to-cart" description="Add to cart" onClick={handleAddToCart}>
                                    <button className={`w-full rounded-md py-2 px-4 font-bold transition-all transform hover:scale-105 ${highContrast ? "bg-yellow-300 text-black hover:bg-yellow-400" : "bg-gray-200 text-black hover:bg-blue-500 hover:text-white"}`}>
                                        Add to Cart
                                        <span className="ml-2 font-extrabold text-back-1000 text-xl stroke-text">
                                            ${getTotalPrice()}
                                        </span>
                                    </button>
                                </VoiceElement>
                                <VoiceElement id="shop-more" description="Shop more" onClick={handleShopMore}>
                                    <button className={`w-full rounded-md py-2 px-4 font-bold transition-all transform hover:scale-105 ${highContrast ? "bg-yellow-300 text-black hover:bg-yellow-400" : "bg-gray-200 text-black hover:bg-blue-500 hover:text-white"}`}>
                                        Shop More
                                    </button>
                                </VoiceElement>
                                <VoiceElement id="buy-now" description="Purchase" onClick={handleBuyNow}>
                                    <button className={`w-full rounded-md py-2 px-4 font-bold transition-all transform hover:scale-105 ${highContrast ? "bg-yellow-300 text-black hover:bg-yellow-400" : "bg-gray-200 text-black hover:bg-blue-500 hover:text-white"}`}>
                                        Purchase
                                        <span className="ml-2 font-extrabold text-back-1000 text-xl stroke-text">
                                            ${getTotalPrice()}
                                        </span>
                                    </button>
                                </VoiceElement>
                            </div>
                        </div>

                        {/* Modifications */}
                        <div className="w-full md:w-2/3 flex-grow space-y-6">
                            {/* Drink Size */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Size:</h3>
                                <div className="grid w-[500px] grid-cols-4 gap-0">
                                    {filteredMods.filter((mod) => ['Small', 'Medium', 'Large'].includes(mod.name)).map((mod, idx) => (
                                        <VoiceElement key={idx} id={`size-${toSnakeCase(mod.name)}`} description={mod.name} onClick={() => setSelectedSize(mod.name)}>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="drinkSize"
                                                    value={mod.name}
                                                    checked={selectedSize === mod.name}
                                                    onClick={(e) => { if (selectedSize === mod.name) { e.target.checked = false; setSelectedSize(""); }}}
                                                    onChange={() => setSelectedSize(mod.name)}
                                                    className={`w-5 h-5 ${highContrast ? "accent-yellow-300" : ""}`}
                                                />
                                                <span>{mod.name}</span>
                                            </div>
                                        </VoiceElement>
                                    ))}
                                </div>
                            </div>
                            {/* Ice Levels */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Ice Level:</h3>
                                <div className="grid w-[500px] grid-cols-4 gap-0">
                                    {filteredMods.filter((mod) => mod.name?.toLowerCase().includes("ice")).map((mod, idx) => (
                                        <VoiceElement key={idx} id={`ice-${toSnakeCase(mod.name)}`} description={mod.name} onClick={() => setSelectedIce(mod.name)}>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="iceLevel"
                                                    value={mod.name}
                                                    checked={selectedIce === mod.name}
                                                    onClick={(e) => { if (selectedIce === mod.name) { e.target.checked = false; setSelectedIce(""); }}}
                                                    onChange={() => setSelectedIce(mod.name)}
                                                    className={`w-5 h-5 ${highContrast ? "accent-yellow-300" : ""}`}
                                                />
                                                <span>{mod.name}</span>
                                            </div>
                                        </VoiceElement>
                                    ))}
                                </div>
                            </div>
                            {/* Sugar Levels */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Sugar Level:</h3>
                                <div className="grid w-[500px] grid-cols-4 gap-0">
                                    {filteredMods.filter((mod) => mod.name?.toLowerCase().includes("sugar")).map((mod, idx) => (
                                        <VoiceElement key={idx} id={`sugar-${toSnakeCase(mod.name)}`} description={mod.name} onClick={() => setSelectedSugar(mod.name)}>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="sugarLevel"
                                                    value={mod.name}
                                                    checked={selectedSugar === mod.name}
                                                    onClick={(e) => { if (selectedSugar === mod.name) { e.target.checked = false; setSelectedSugar(""); }}}
                                                    onChange={() => setSelectedSugar(mod.name)}
                                                    className={`w-5 h-5 ${highContrast ? "accent-yellow-300" : ""}`}
                                                />
                                                <span>{mod.name}</span>
                                            </div>
                                        </VoiceElement>
                                    ))}
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold mb-2">Toppings:</h3>
                            <div className="w-[500px] mb-4">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    {filteredToppings.map((mod, idx) => (
                                        <VoiceElement key={idx} id={`topping-${toSnakeCase(mod.name)}`} description={mod.name} onClick={() => handleToggleTopping(mod.name)}>
                                            <label className={`flex items-center justify-between px-3 py-2 rounded border ${highContrast ? "border-yellow-300" : "border-gray-700"}`}>
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
                                                        className={`w-4 h-4 ${highContrast ? "accent-yellow-300" : ""}`}
                                                    />
                                                    <span>{mod.name}</span>
                                                </div>
                                                <span className="font-bold">${mod.price?.toFixed(2)}</span>
                                            </label>
                                        </VoiceElement>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </VoiceLayer>
        </HighContrastWrapper>
    );
}

export default function DrinkDetails() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-[telegraf]"><div>Loading...</div></div>}>
            <DrinkDetailsWithParams />
        </Suspense>
    );
}

function DrinkDetailsWithParams() {
    const searchParams = useSearchParams();
    const drinkName = searchParams.get("name") || "Selected Drink";
    const drinkPrice = parseFloat(searchParams.get("price")) || 0;
    return <DrinkDetailsContent drinkName={drinkName} drinkPrice={drinkPrice} />;
}
