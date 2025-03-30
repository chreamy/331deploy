"use client";
import { useState } from "react";

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
                <a href="/categories">
                    <button className="startorder-button">
                        Tap to Start Order
                    </button>
                </a>
            </div>
        </div>
    );
}