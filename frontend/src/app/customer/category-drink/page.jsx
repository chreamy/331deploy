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

function toSnakeCase(str) {
    return str.toLowerCase().replace(/ /g, "-");
}

function CategoryContent({ category }) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [drinks, setDrinks] = useState([]);
    const [loading, setLoading] = useState(true);

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
                <div className="min-h-screen font-[telegraf] p-4 md:p-8"
                    style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
                    
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
                                    style={{ color: 'var(--foreground)' }}
                                />
                            </VoiceElement>
                        </div>

                        {/* Category Header */}
                        <h2 className="text-3xl font-extrabold mt-0 mb-6 text-center drop-shadow-md"
                            style={{ color: 'var(--foreground)' }}>
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
                                        <FaSearch className="absolute top-2.5 left-3"
                                            style={{ color: 'var(--foreground)' }}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Search drinks..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-white"
                                            style={{
                                                backgroundColor: "var(--card-bg)",
                                                borderColor: "var(--border-color)",
                                                color: "var(--foreground)"
                                            }}
                                        />
                                    </div>
                                </div>
                            </VoiceElement>
                        </div>

                        {/* Loading or No Drinks */}
                        {loading ? (
                            <p className="text-center text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                                Loading...
                            </p>
                        ) : filteredDrinks.length === 0 ? (
                            <p className="text-center text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                                No drinks found.
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredDrinks.map((drink, index) => (
                                    <VoiceElement
                                        key={index}
                                        id={`drink-${toSnakeCase(drink.name)}`}
                                        description={drink.name}
                                        onClick={() => handleDrinkSelect(drink.name, drink.price)}
                                    >
                                        <div
                                            className="rounded-2xl p-6 text-center shadow-lg hover:scale-105 hover:shadow-2xl transition-transform cursor-pointer"
                                            style={{
                                                backgroundColor: "var(--card-bg)",
                                                border: "2px solid var(--border-color)",
                                                color: "var(--foreground)"
                                            }}
                                        >
                                            {/* Drink Image */}
                                            <div className="w-full h-48 flex justify-center items-center">
                                                <img
                                                    src={`/drink-images/${toSnakeCase(drink.name)}.png`}
                                                    alt={drink.name}
                                                    className="max-w-full max-h-full object-contain rounded-md border"
                                                    style={{ borderColor: "var(--border-color)" }}
                                                />
                                            </div>

                                            {/* Drink Name and Price */}
                                            <div className="flex justify-center items-center mt-2">
                                                <p className="text-xl font-semibold">{drink.name}</p>
                                                <p className="ml-4 text-lg font-medium"
                                                    style={{ color: 'var(--foreground)' }}>
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
                <div className="min-h-screen font-[telegraf] p-4 md:p-8 flex items-center justify-center"
                    style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
                    <div className="text-xl">Loading...</div>
                </div>
            }>
            <CategoryWithParams />
        </Suspense>
    );
}

function CategoryWithParams() {
    const searchParams = useSearchParams();
    const category = searchParams.get("name");
    return <CategoryContent category={category} />;
}
