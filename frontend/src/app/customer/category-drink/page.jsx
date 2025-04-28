"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { IoArrowBackCircleOutline } from "react-icons/io5";
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

function CategoryContent({ category }) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [drinks, setDrinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { highContrast: isHighContrast } = useHighContrast(); // Use global high-contrast context

    useEffect(() => {
        if (!category) return;
        setLoading(true);
        fetch(`${SERVER}/categories`)
            .then((res) => res.json())
            .then((data) => {
                const drinksInCategory = data[category] || [];
                setDrinks(drinksInCategory);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Fetch error:", err);
                setLoading(false);
            });
    }, [category]);

    const filteredDrinks = drinks.filter((drink) =>
        drink.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleBack = () => {
        router.back();
    };

    const handleDrinkSelect = (drinkName, price) => {
        router.push(`/customer/modifications?name=${toSnakeCase(drinkName)}&price=${price}`);
    };

    return (
        <HighContrastWrapper>
            <VoiceLayer>
                <div
                    className="min-h-screen font-[telegraf] p-4 md:p-8"
                    style={{
                        backgroundColor: isHighContrast ? "var(--background)" : "#3D2B1F",
                        color: isHighContrast ? "var(--foreground)" : "#EED9C4", // Light text for dark background
                    }}
                >
                    <Nav userRole="customer" />

                    <div className="mt-8">
                        {/* Back Button */}
                        <div className="mt-6">
                            <VoiceElement
                                id="back-button"
                                description="Go back"
                                onClick={handleBack}
                            >
                                <IoArrowBackCircleOutline
                                    className="text-3xl cursor-pointer"
                                    style={{
                                        color: isHighContrast
                                            ? "var(--foreground)"
                                            : "#EED9C4",
                                    }}
                                />
                            </VoiceElement>
                        </div>

                        {/* Category Header */}
                        <h2
                            className="text-3xl font-extrabold mt-0 mb-6 text-center drop-shadow-md"
                            style={{
                                color: isHighContrast
                                    ? "var(--foreground)"
                                    : "#EED9C4",
                            }}
                        >
                            {category || "Drinks"}
                        </h2>

                        {/* Search Bar */}
                        <div className="relative mb-6">
                            <VoiceElement
                                id="search-input"
                                description="Search drinks"
                                isInput={true}
                                onClick={() => {}}
                            >
                                <div className="flex justify-center mb-4">
                                    <div className="relative w-full max-w-md">
                                        <FaSearch
                                            className="absolute top-2.5 left-3"
                                            style={{
                                                color: isHighContrast
                                                    ? "var(--foreground)"
                                                    : "black",
                                            }}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Search drinks..."
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                            className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                                                isHighContrast
                                                    ? ""
                                                    : "bg-gray-100 text-black border-[#C2A385]"
                                            }`}
                                            style={{
                                                backgroundColor: isHighContrast
                                                    ? "var(--card-bg)"
                                                    : "#F3F4F6", // bg-gray-100
                                                borderColor: isHighContrast
                                                    ? "var(--border-color)"
                                                    : "#C2A385",
                                                color: isHighContrast
                                                    ? "var(--foreground)"
                                                    : "#000000",
                                            }}
                                        />
                                    </div>
                                </div>
                            </VoiceElement>
                        </div>

                        {/* Loading or No Drinks */}
                        {loading ? (
                            <p
                                className="text-center text-lg font-semibold"
                                style={{
                                    color: isHighContrast
                                        ? "var(--foreground)"
                                        : "#EED9C4",
                                }}
                            >
                                Loading...
                            </p>
                        ) : filteredDrinks.length === 0 ? (
                            <p
                                className="text-center text-lg font-semibold"
                                style={{
                                    color: isHighContrast
                                        ? "var(--foreground)"
                                        : "#EED9C4",
                                }}
                            >
                                No drinks found.
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredDrinks.map((drink, index) => (
                                    <VoiceElement
                                        key={index}
                                        id={`drink-${toSnakeCase(drink.name)}`}
                                        description={drink.name}
                                        onClick={() =>
                                            handleDrinkSelect(
                                                drink.name,
                                                drink.price
                                            )
                                        }
                                    >
                                        <div
                                            className={`rounded-2xl p-6 text-center shadow-lg hover:scale-105 hover:shadow-2xl transition-transform cursor-pointer ${
                                                isHighContrast
                                                    ? ""
                                                    : "bg-white text-gray-900 border border-[#C2A385] hover:bg-[#EED9C4]"
                                            }`}
                                            style={{
                                                backgroundColor: isHighContrast
                                                    ? "var(--card-bg)"
                                                    : "#ffffff",
                                                border: isHighContrast
                                                    ? "2px solid var(--border-color)"
                                                    : "1px solid #C2A385",
                                                color: isHighContrast
                                                    ? "var(--foreground)"
                                                    : "#111827", // text-gray-900
                                            }}
                                        >
                                            {/* Drink Image */}
                                            <div className="w-full h-48 flex justify-center items-center">
                                                <img
                                                    src={`/drink-images/${toSnakeCase(
                                                        drink.name
                                                    )}.png`}
                                                    alt={drink.name}
                                                    className="max-w-full max-h-full object-contain rounded-md border"
                                                    style={{
                                                        borderColor: isHighContrast
                                                            ? "var(--border-color)"
                                                            : "#C2A385", // Match card border
                                                    }}
                                                />
                                            </div>

                                            {/* Drink Name and Price */}
                                            <div className="flex justify-center items-center mt-2">
                                                <p
                                                    className={`text-xl font-semibold ${
                                                        isHighContrast
                                                            ? ""
                                                            : "text-gray-900"
                                                    }`}
                                                    style={{
                                                        color: isHighContrast
                                                            ? "var(--foreground)"
                                                            : "#111827",
                                                    }}
                                                >
                                                    {drink.name}
                                                </p>
                                                <p
                                                    className={`ml-4 text-lg font-medium ${
                                                        isHighContrast
                                                            ? ""
                                                            : "text-black"
                                                    }`}
                                                    style={{
                                                        color: isHighContrast
                                                            ? "var(--foreground)"
                                                            : "#000000",
                                                    }}
                                                >
                                                    ${drink.price.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </VoiceElement>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </VoiceLayer>
        </HighContrastWrapper>
    );
}

export default function CategoryPage() {
    return (
        <Suspense
            fallback={
                <div
                    className="min-h-screen font-[telegraf] p-4 md:p-8 flex items-center justify-center"
                    style={{
                        backgroundColor: "var(--background)",
                        color: "var(--foreground)",
                    }}
                >
                    <div className="text-xl">Loading...</div>
                </div>
            }
        >
            <CategoryWithParams />
        </Suspense>
    );
}

function CategoryWithParams() {
    const searchParams = useSearchParams();
    const category = searchParams.get("name");
    return <CategoryContent category={category} />;
}
