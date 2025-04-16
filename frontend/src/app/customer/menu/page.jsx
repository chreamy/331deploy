"use client";
import { SERVER } from "@/app/const";
import { useEffect, useState } from "react";
import Nav from "@/app/nav";

export default function BubbleTeaShop() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryDrinks, setCategoryDrinks] = useState({});
    const [animateLeftPane, setAnimateLeftPane] = useState(false);
    const [showRightItems, setShowRightItems] = useState([]);

    function toSnakeCase(str) {
        return str.toLowerCase().replace(/ /g, "-");
    }

    useEffect(() => {
        fetch(`${SERVER}/categories`)
            .then((res) => res.json())
            .then((data) => {
                setCategoryDrinks(data);
                const fetchedCategories = Object.keys(data);
                setCategories(fetchedCategories);
                setLoading(false);

                // Begin animation after data loads
                setTimeout(() => {
                    setAnimateLeftPane(true);
                }, 300); // small delay before left pane comes in

                // Stagger right pane item animations
                fetchedCategories.forEach((_, i) => {
                    setTimeout(() => {
                        setShowRightItems((prev) => {
                            const next = [...prev];
                            next[i] = true;
                            return next;
                        });
                    }, 600 + i * 200); // delay each one by 200ms
                });
            })
            .catch((err) => {
                console.error("Failed to fetch categories:", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen font-[telegraf] p-4 md:p-8 overflow-x-hidden bg-[#3D2B1F]">
            <Nav userRole="customer" />
            <div className="w-full h-[80vh] flex gap-6 mt-8">
                <div
                    className={`w-2/5 ${
                        loading ? "hidden" : "flex"
                    }flex-col h-full items-center relative rounded-[30px] transform transition-all duration-700 ease-out ${
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
                    }}
                >
                    <h2 className="text-[40px] font-extrabold mt-6 mb-6 text-center text-black drop-shadow-md">
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
                            <a
                                href={`/customer/category-drink?name=${encodeURIComponent(
                                    category
                                )}`}
                                key={index}
                                className={`relative group block transform transition-all duration-500 ease-in-out ${
                                    showRightItems[index]
                                        ? "translate-y-0 opacity-100"
                                        : "translate-y-10 opacity-0"
                                }`}
                            >
                                <div
                                    className="border border-[#C2A385] rounded-2xl p-8 text-center 
                                                text-gray-900 bg-white shadow-lg 
                                                hover:shadow-2xl transition-transform hover:bg-[#EED9C4]"
                                >
                                    <span className="text-xl md:text-2xl font-semibold">
                                        {category}
                                    </span>

                                    {categoryDrinks[category]?.length > 0 && (
                                        <div
                                            className=" 
                                                        flex justify-between gap-2 px-10 opacity-0 group-hover:h-[15vh] h-[0px] group-hover:opacity-100 transition-all duration-300"
                                        >
                                            {categoryDrinks[category]
                                                .slice(0, 6)
                                                .map((drink, i) => (
                                                    <img
                                                        key={i}
                                                        src={`/drink-images/${toSnakeCase(
                                                            drink.name
                                                        )}.png`}
                                                        alt={drink.name}
                                                        className="h-full aspect-square object-cover"
                                                    />
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
