"use client";
import { useState, useEffect } from "react";
import Nav from "@/app/nav";

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
        { name: "broken clouds", image: "/weather-images/04.png",},
        { name: "shower rain", image: "/weather-images/09.png" },
        { name: "rain day", image: "/weather-images/10d.png" },
        { name: "rain night", image: "/weather-images/10n.png" },
        { name: "thunderstorm", image: "/weather-images/11.png" },
        { name: "snow", image: "/weather-images/13.png" },
        { name: "mist", image: "/weather-images/50.png" },
    ];

    const currentDate = new Date();
    var hours = currentDate.getHours();
    var AMPM = '';
    if (hours === 0) {
        hours = 12; 
        AMPM = ' AM';
      } else if (hours > 12) {
        hours = hours - 12; 
        AMPM = ' PM';
      }
    
    var minutes = currentDate.getMinutes();

    if (minutes < 10) {
        minutes = '0' + minutes
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
            var imageName = '';
            if (data.weather[0].description === 'clear sky' || data.weather[0].description === 'few clouds' || data.weather[0].description === 'rain') {
                if (AMPM === ' PM') {
                    imageName = data.weather[0].description + ' night';
                }
                else {
                    imageName = data.weather[0].description + ' day';
                }
            }
            else {
                imageName = data.weather[0].description;
            }

            // const foundImage = weatherImg.find(name => name === imageName);
            // if (foundImage) setimageSrc(foundImage.image);
            // console.log(item.name);
            
            } catch (error) {
                console.error("Error fetching weather data:", error);
            }
    };
    
    useEffect(()=> {
        fetchWeather('College Station');
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-700 p-4 md:p-8">
            {/* Welcome Message */}
            <div className="text-center mt-6 mb-6">
                <h1 className="text-4xl font-bold text-white">
                    Welcome to ShareTea
                </h1>
            </div>

            {/* Start Order Button */}
            <div className="text-center mb-8">
                <a href="/customer/menu">
                <button className="text-4xl font-bold px-25 py-10 bg-green-500 text-white rounded-xl shadow-md 
                                hover:scale-105 hover:shadow-xl transition-transform">
                    Tap to Start Order
                    </button>
                </a>
            </div>

            {/* Start Order Button */}
            <div className="text-center mb-8">
                <a href="/manager/management">
                <button className="text-4xl font-bold px-25 py-10 bg-green-500 text-white rounded-xl shadow-md 
                                hover:scale-105 hover:shadow-xl transition-transform">
                    Manager Login
                    </button>
                </a>
            </div>

            {/* Weather Section */}
            <div className="text-center mb-2">
                {weather ? (
                    <div className="text-4xl font-bold px-5 py-5 bg-white text-black rounded-xl">
                        <h1>{Time}</h1>
                        <h2>Weather in {weather.name}</h2>
                        <p>Temperature: {(weather.main.temp * 9/5 + 32).toFixed(0)}°F</p>
                        <p>Feels Like: {(weather.main.feels_like * 9/5 + 32).toFixed(0)}°F</p>
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-2">

            </div>
                    </div>
                    
                ) : (
                    <div className="weather-box"> Unable to fetch weather data.</div>
                )}
            </div>
        </div>
    );
}