"use client";
import { useState, useEffect } from "react";

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
        <div className="homepage-body">
            {/* Welcome Message */}
            <div className="homepage-message">
                <h1 className="homepage-title">
                    Welcome to ShareTea
                </h1>
            </div>

            {/* Start Order Button */}
            <div className="startorder-body">
                <a href="/customer/menu">
                    <button className="startorder-button">
                        Tap to Start Order
                    </button>
                </a>
            </div>

            {/* Weather Section */}
            <div className="weather-body">
                {weather ? (
                    <div className="weather-box">
                        <h1>{Time}</h1>
                        <h2>Weather in {weather.name}</h2>
                        <p>Temperature: {(weather.main.temp * 9/5 + 32).toFixed(0)}°F</p>
                        <p>Feels Like: {(weather.main.feels_like * 9/5 + 32).toFixed(0)}°F</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

            </div>
                    </div>
                    
                ) : (
                    <div className="weather-box"> Unable to fetch weather data.</div>
                )}
            </div>
        </div>
    );
}