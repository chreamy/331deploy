"use client";
import { useState, useEffect } from "react";
import Script from "next/script";
import Nav from "./nav";

export default function BubbleTeaShop() {
    const [search, setSearch] = useState("");
    const categories = [
        "Milk Tea",
        "Fruit Tea",
        "Smoothies",
        "Cheese Foam",
        "Yakult Series",
        "Toppings",
        "Iced Blends",
        "Seasonal Specials",
    ];
    const [imageSrc, setimageSrc] = useState(null);

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

    const currentDate = new Date();
    var hours = currentDate.getHours();
    var AMPM = "";
    if (hours === 0) {
        hours = 12;
        AMPM = " AM";
    } else if (hours > 12) {
        hours = hours - 12;
        AMPM = " PM";
    }

    var minutes = currentDate.getMinutes();

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    const Time = `${hours}:${minutes}${AMPM}`;

    // Weather inforation
    const [weather, setWeatherData] = useState(false);
    const apiKey = "2ee7f942dfb54b03fa89c972814a9842";

    // Fetch weather data
    const fetchWeather = async (city) => {
        try {
          const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=Metric&appid=${apiKey}`;
          const response = await fetch(url);
          const data = await response.json();
          setWeatherData(data);
      
          let imageName = "";
      
          // Build image name using description + time of day
          if (
            data.weather[0].description === "clear sky" ||
            data.weather[0].description === "few clouds" ||
            data.weather[0].description === "rain"
          ) {
            imageName =
              data.weather[0].description +
              (AMPM === " PM" ? " night" : " day");
          } else {
            imageName = data.weather[0].description;
          }
      
          const foundImage = weatherImg.find(
            (item) => item.name.toLowerCase() === imageName.toLowerCase()
          );
      
          if (foundImage) {
            setimageSrc(foundImage.image);
          } else {
            console.warn("No matching weather image found for:", imageName);
          }
        } catch (error) {
          console.error("Error fetching weather data:", error);
        }
      };
      

    useEffect(() => {
        fetchWeather("College Station");
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-700 p-4 md:p-8 font-[Roboto]">
            {/* Top Nav Bar */}
            <Nav userRole="guest" />

            {/* Welcome Message */}
            <div className="text-center mt-6 mb-6">
                <h1 className="text-4xl font-bold text-[#EED9C4] drop-shadow-md">
                    Welcome to ShareTea Web Portal
                </h1>
            </div>

            {/* Button Row */}
            <div className="flex justify-center gap-6 mb-8">
                {/* Customer View Button */}
                <a href="/customer/menu">
                    <button
                        className="text-2xl font-bold px-12 py-6 bg-green-500 text-white rounded-xl shadow-md
                                        hover:scale-105 hover:shadow-xl transition-transform"
                    >
                        Customer View
                    </button>
                </a>

                {/* Manager View Button */}
                <a href="/manager/management">
                    <button
                        className="text-2xl font-bold px-12 py-6 bg-blue-500 text-white rounded-xl shadow-md
                                        hover:scale-105 hover:shadow-xl transition-transform"
                    >
                        Manager View
                    </button>
                </a>

                {/* Cashier View Button */}
                <a href="/cashier">
                    <button
                        className="text-2xl font-bold px-12 py-6 bg-yellow-500 text-white rounded-xl shadow-md
                                        hover:scale-105 hover:shadow-xl transition-transform"
                    >
                        Cashier View
                    </button>
                </a>
            </div>

            {/* Weather Section */}
            <div className="text-center mb-2">
            {weather && (
                <div className="relative group inline-block">
                    {/* Compact View (Always Visible) */}
                    <div className="flex flex-col items-center">
                    {imageSrc && (
                        <img
                        src={imageSrc}
                        alt={weather.weather[0].description}
                        className="w-20 h-20"
                        />
                    )}
                    <p className="text-2xl font-semibold capitalize text-white mt-2">
                        {weather.weather[0].description}
                    </p>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max bg-white text-black text-center rounded-xl px-4 py-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <h1 className="text-xl font-bold">{Time}</h1>
                    <h2 className="text-lg mb-1">Weather in {weather.name}</h2>
                    <p>
                        Temp: {((weather.main.temp * 9) / 5 + 32).toFixed(0)}°F
                    </p>
                    <p>
                        Feels Like:{" "}
                        {((weather.main.feels_like * 9) / 5 + 32).toFixed(0)}°F
                    </p>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
}