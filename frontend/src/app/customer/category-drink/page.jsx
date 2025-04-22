"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { SERVER } from "@/app/const";
import Nav from "@/app/nav";
import VoiceLayer from "@/app/components/VoiceLayer";
import VoiceElement from "@/app/components/VoiceElement";

function toSnakeCase(str) {
  return str.toLowerCase().replace(/ /g, "-");
}

function CategoryContent({ category }) {
  const router = useRouter();

  // Instantiate states
  const [search, setSearch] = useState("");
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch drinks from the server when a category is selected
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

  // Filter functionality for searching
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
    <VoiceLayer>
      <div className="min-h-screen font-[telegraf] p-4 md:p-8 bg-[#3D2B1F]">
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
                className="text-3xl cursor-pointer text-[#EED9C4]"
              />
            </VoiceElement>
          </div>

          {/* Category Header */}
          <h2 className="text-3xl font-extrabold mt-0 mb-6 text-center text-[#EED9C4] drop-shadow-md">
            {category || "Drinks"}
          </h2>

          {/* Search Bar */}
          <div className="relative">
            <VoiceElement
              id="search-input"
              description="Search drinks"
              isInput={true}
              onClick={() => {}}
            >
              <input
                type="text"
                placeholder="Search drinks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </VoiceElement>
          </div>

          {/* Loading or No Drinks Message */}
          {loading ? (
            <p className="text-center text-[#EED9C4] text-lg font-semibold">
              Loading...
            </p>
          ) : filteredDrinks.length === 0 ? (
            <p className="text-center text-[#EED9C4] text-lg font-semibold">
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
                    className="border border-[#C2A385] rounded-2xl p-6 text-center 
                                                text-gray-900 bg-white shadow-lg 
                                                hover:scale-105 hover:shadow-2xl transition-transform hover:bg-[#EED9C4] cursor-pointer">
                    {/* Drink Image */}
                    <div className="w-full h-48 flex justify-center items-center">
                      <img
                        src={`/drink-images/${toSnakeCase(drink.name)}.png`}
                        alt={drink.name}
                        className="max-w-full max-h-full object-contain rounded-md"
                      />
                    </div>

                    {/* Drink Name and Price */}
                    <div className="flex justify-center items-center mt-2">
                      <p className="text-xl font-semibold">{drink.name}</p>
                      <p className="ml-4 text-lg font-medium text-black">
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
  );
}

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen font-[telegraf] p-4 md:p-8 bg-[#3D2B1F] flex items-center justify-center">
          <div className="text-[#EED9C4] text-xl">Loading...</div>
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
