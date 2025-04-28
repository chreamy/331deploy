"use client";
import { useState, useEffect } from "react";
import Script from "next/script";
import Nav from "./nav";
import HighContrastWrapper from "./components/HighContrastWrapper";

export default function BubbleTeaShop() {
    const [search, setSearch] = useState("");
    const [hoveredView, setHoveredView] = useState(null);
    const [isHighContrast, setIsHighContrast] = useState(false);

    const categories = [
        "Milk Tea", "Fruit Tea", "Smoothies", "Cheese Foam", 
        "Yakult Series", "Toppings", "Iced Blends", "Seasonal Specials"
    ];

    const views = [
        { link: "/customer/menu", description: "Customer View", preview: "/previews/customer.png" },
        { link: "/manager", description: "Manager View", preview: "/previews/manager.png" },
        { link: "/cashier", description: "Cashier View", preview: "/previews/cashier.png" },
    ];

    const weatherImg = [
        { name: "clear sky day", image: "/weather-images/01d.png" },
        { name: "clear sky night", image: "/weather-images/01n.png" },
        { name: "few clouds day", image: "/weather-images/02d.png" },
        { name: "few clouds night", image: "/weather-images/02n.png" },
        { name: "scattered clouds", image: "/weather-images/03.png" },
        { name: "broken clouds", image: "/weather-images/04.png" },
        { name: "shower rain", image: "/weather-images/09.png" },
        { name: "rain day", image: "/weather-images/10d.png" },
        { name: "rain night", image: "/weather-images/10n.png" },
        { name: "thunderstorm", image: "/weather-images/11.png" },
        { name: "snow", image: "/weather-images/13.png" },
        { name: "mist", image: "/weather-images/50.png" },
    ];

    const [weather, setWeatherData] = useState(false);
    const [imageSrc, setimageSrc] = useState(null);
    const apiKey = "2ee7f942dfb54b03fa89c972814a9842";

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const url = `https://api.openweathermap.org/data/2.5/weather?q=College Station&units=Metric&appid=${apiKey}`;
                const response = await fetch(url);
                const data = await response.json();
                setWeatherData(data);

                let timeOfDay = (new Date().getHours() >= 7 && new Date().getHours() <= 20) ? "day" : "night";
                let imageName = (["clear sky", "few clouds", "rain"].includes(data.weather[0].description))
                    ? `${data.weather[0].description} ${timeOfDay}`
                    : data.weather[0].description;

                const foundImage = weatherImg.find(item => item.name.toLowerCase() === imageName.toLowerCase());
                if (foundImage) {
                    setimageSrc(foundImage.image);
                }
            } catch (error) {
                console.error("Error fetching weather data:", error);
            }
        };
        fetchWeather();
    }, []);

    const currentDate = new Date();
    let hours = currentDate.getHours();
    const minutes = currentDate.getMinutes().toString().padStart(2, "0");
    const AMPM = hours >= 12 ? " PM" : " AM";
    hours = hours % 12 || 12;
    const Time = `${hours}:${minutes}${AMPM}`;

    return (
        <HighContrastWrapper onContrastChange={setIsHighContrast}>
            <div 
                className="h-screen relative flex flex-col p-4 md:p-8" 
                style={{ 
                    backgroundColor: isHighContrast ? "var(--background)" : "bg-gray-100",
                    color: isHighContrast ? "var(--foreground)" : "text-gray-900",
                    fontFamily: "telegraf, sans-serif" 
                }}
            >
                {/* Top Nav Bar */}
                <Nav userRole="guest" />

                {/* Welcome Message */}
                <div className="text-center mt-6 mb-6">
                    <h1 className="text-4xl font-bold drop-shadow-md">
                        Welcome to ShareTea Web Portal
                    </h1>
                </div>

                {/* Weather Section */}
                <div className="text-center mt-4 mb-8">
                    {weather && (
                        <div className="relative group inline-block">
                            <div className="flex flex-col items-center">
                                {imageSrc && (
                                    <img
                                        src={imageSrc}
                                        alt={weather.weather[0].description}
                                        className="w-20 h-20 rounded-full border-2"
                                        style={{ 
                                            borderColor: isHighContrast ? "var(--border-color)" : "white" 
                                        }}
                                    />
                                )}
                                <p className="text-2xl font-semibold capitalize mt-2">
                                    {weather.weather[0].description}
                                </p>
                            </div>

                            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max rounded-xl px-4 py-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                                style={{ 
                                    backgroundColor: isHighContrast ? "var(--card-bg)" : "#ffffff",
                                    color: isHighContrast ? "var(--foreground)" : "#000000",
                                    border: `2px solid ${isHighContrast ? "var(--border-color)" : "##e5e7eb"}`
                                }}>
                                <h1 className="text-xl font-bold">{Time}</h1>
                                <h2 className="text-lg mb-1">Weather in {weather.name}</h2>
                                <p>Temp: {((weather.main.temp * 9) / 5 + 32).toFixed(0)}°F</p>
                                <p>Feels Like: {((weather.main.feels_like * 9) / 5 + 32).toFixed(0)}°F</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Button Row */}
                <div className="flex h-full justify-center gap-6 max-w-screen mb-8">
                    {views.map((item, index) => (
                        <a 
                            key={index} 
                            href={item.link} 
                            className="h-full flex max-w-[40%] transition-all duration-500 ease-in-out"
                        >
                            <div
                                className={`text-2xl font-bold px-12 py-6 flex items-center justify-between w-auto rounded-xl shadow-md
                                    hover:scale-105 hover:shadow-xl cursor-pointer transition-all duration-500 ease-in-out
                                    ${!isHighContrast ? 
                                        'bg-smoke-50 border-2 border-white text-white hover:text-black hover:bg-white' : 
                                        ''}`}
                                style={isHighContrast ? {
                                    backgroundColor: "var(--card-bg)",
                                    color: "var(--foreground)",
                                    border: "2px solid var(--border-color)",
                                } : {}}
                                onMouseEnter={() => setHoveredView(item.preview)}
                                onMouseLeave={() => setHoveredView(null)}
                            >
                                <button
                                    className={!isHighContrast ? "bg-transparent" : ""}
                                    style={isHighContrast ? {
                                        backgroundColor: "transparent",
                                        color: "inherit"
                                    } : {}}
                                >
                                    {item.description}
                                </button>

                                <img
                                    src={item.preview}
                                    alt={`${item.description} preview`}
                                    className={`object-cover rounded-lg shadow-xl border-2
                                        ${hoveredView === item.preview ? "w-[30vh] ml-4 opacity-100" : "w-[0px] ml-0 opacity-0"}`}
                                    style={{
                                        borderColor: isHighContrast ? "var(--border-color)" : "white",
                                        transitionProperty: "width, opacity"
                                    }}
                                />
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </HighContrastWrapper>
    );
}