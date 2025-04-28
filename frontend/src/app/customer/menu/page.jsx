"use client";
import { SERVER } from "@/app/const";
import { useEffect, useState } from "react";
import Nav from "@/app/nav";
import { useRouter } from "next/navigation";
import VoiceElement from "@/app/components/VoiceElement";
import VoiceLayer from "@/app/components/VoiceLayer";
import HighContrastWrapper from "@/app/components/HighContrastWrapper";
import { useHighContrast } from "@/app/components/HighContrastContext";

export default function BubbleTeaShop() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryDrinks, setCategoryDrinks] = useState({});
    const [animateLeftPane, setAnimateLeftPane] = useState(false);
    const [showRightItems, setShowRightItems] = useState([]);
    const router = useRouter();
    const { highContrast: isHighContrast } = useHighContrast(); // Use highContrast from context

    function toSnakeCase(str) {
        return str.toLowerCase().replace(/ /g, "-");
    }

    const handleCategoryClick = (category) => {
        router.push(`/customer/category-drink?name=${encodeURIComponent(category)}`);
    };

    useEffect(() => {
        fetch(`${SERVER}/categories`)
            .then((res) => res.json())
            .then((data) => {
                setCategoryDrinks(data);
                const fetchedCategories = Object.keys(data);
                setCategories(fetchedCategories);
                setLoading(false);

                setTimeout(() => {
                    setAnimateLeftPane(true);
                }, 300);

                fetchedCategories.forEach((_, i) => {
                    setTimeout(() => {
                        setShowRightItems((prev) => {
                            const next = [...prev];
                            next[i] = true;
                            return next;
                        });
                    }, 600 + i * 200);
                });
            })
            .catch((err) => {
                console.error("Failed to fetch categories:", err);
                setLoading(false);
            });
    }, []);

    return (
        <HighContrastWrapper>
            <VoiceLayer>
                <div
                    className="min-h-screen font-[telegraf] p-4 md:p-8"
                    style={{
                        backgroundColor: isHighContrast ? "var(--background)" : "#3D2B1F",
                        color: isHighContrast ? "var(--foreground)" : "#ffffff", // Light text on dark background
                    }}
                >
                    <Nav userRole="customer" />

                    <div className="w-full h-[80vh] flex gap-6 mt-8">
                        {/* Left Pane */}
                        <div
                            className={`w-2/5 ${
                                loading ? "hidden" : "flex"
                            } flex-col h-full items-center relative rounded-[30px] 
                                        transform transition-all duration-700 ease-out ${
                                            animateLeftPane
                                                ? "translate-x-0 opacity-100"
                                                : "-translate-x-full opacity-0"
                                        }`}
                            style={{
                                backgroundImage: "url('/menu.jpg')",
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                                objectFit: "cover",
                                border: isHighContrast
                                    ? "3px solid var(--border-color)"
                                    : "none",
                            }}
                        >
                            <h2
                                className="text-[40px] font-extrabold mt-6 mb-6 text-center"
                                style={{
                                    color: isHighContrast ? "black" : "black",
                                }}
                            >
                                Choose Your Bubble Tea!
                            </h2>
                        </div>

                        {/* Right Pane */}
                        <div
                            className={`w-3/5 h-full ${
                                loading ? "hidden" : "flex"
                            } flex-col overflow-y-auto`}
                        >
                            <div className="grid grid-cols-1 gap-8 overflow-y-hidden">
                                {categories.map((category, index) => (
                                    <VoiceElement
                                        key={index}
                                        id={`category-${toSnakeCase(category)}`}
                                        description={category}
                                        onClick={() => handleCategoryClick(category)}
                                        className={`relative group block transform transition-all duration-500 ease-in-out ${
                                            showRightItems[index]
                                                ? "translate-y-0 opacity-100"
                                                : "translate-y-10 opacity-0"
                                        }`}
                                    >
                                        <div
                                            className={`rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-transform cursor-pointer ${
                                                isHighContrast
                                                    ? ""
                                                    : "bg-white text-gray-900 border border-[#C2A385] hover:bg-[#EED9C4]"
                                            }`}
                                            style={{
                                                backgroundColor: isHighContrast
                                                    ? "var(--card-bg)"
                                                    : "#ffffff",
                                                color: isHighContrast
                                                    ? "var(--foreground)"
                                                    : "#111827", // text-gray-900
                                                border: isHighContrast
                                                    ? "2px solid var(--border-color)"
                                                    : "1px solid #C2A385",
                                            }}
                                        >
                                            <span
                                                className={`text-xl md:text-2xl font-semibold ${
                                                    isHighContrast ? "" : "text-gray-900"
                                                }`}
                                                style={{
                                                    color: isHighContrast
                                                        ? "var(--foreground)"
                                                        : "#111827",
                                                }}
                                            >
                                                {category}
                                            </span>

                                            {categoryDrinks[category]?.length > 0 && (
                                                <div className="flex justify-between gap-2 px-10 opacity-0 group-hover:h-[15vh] h-[0px] group-hover:opacity-100 transition-all duration-300">
                                                    {categoryDrinks[category]
                                                        .slice(0, 6)
                                                        .map((drink, i) => (
                                                            <img
                                                                key={i}
                                                                src={`/drink-images/${toSnakeCase(
                                                                    drink.name
                                                                )}.png`}
                                                                alt={drink.name}
                                                                className="h-full aspect-square object-cover rounded-md border"
                                                                style={{
                                                                    borderColor: isHighContrast
                                                                        ? "var(--border-color)"
                                                                        : "#C2A385", // Match card border
                                                                }}
                                                            />
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    </VoiceElement>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </VoiceLayer>
        </HighContrastWrapper>
    );
}
