"use client";
import React from "react";
import { useState, useEffect } from "react";
import TranslateToggle from "./components/TranslateToggle";
import {
    FaHome,
    FaVolumeUp,
    FaShoppingCart,
    FaLanguage,
    FaLine,
    FaChartLine,
    FaPaperclip,
    FaPaperPlane,
    FaRegPaperPlane,
    FaHandPaper,
    FaPen,
    FaGripLines,
    FaGripHorizontal,
    FaGratipay,
} from "react-icons/fa";

const Nav = () => {
    return (
        <nav>
            <header className="w-full border-b p-4 flex items-center justify-between bg-white shadow-sm rounded-lg">
                {/* Left Icons */}
                <div className="flex items-center gap-4 relative">
                <button
                    className="text-2xl text-gray-700 hover:text-blue-500 cursor-pointer"
                    title="Home"
                >
                    <a href="/" className="cursor-pointer">
                        <FaHome />
                    </a>
                </button>

                <button
                    className="text-2xl text-gray-700 hover:text-blue-500"
                    title="Sound"
                >
                    <FaVolumeUp />
                </button>

                {/* Translate button */}
                <TranslateToggle />
            </div>

                {/* Center Title */}
                <h1 className="text-xl sm:text-2xl font-semibold text-center text-black flex-1">
                    ShareTea Customer Portal
                </h1>

                {/* Right Side: Toggle + Cart */}
                <div className="flex items-center gap-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600"></div>
                    </label>

                    <button
                        className="text-2xl text-gray-700 hover:text-blue-500"
                        title="Cart"
                    >
                        <a href="/customer/cart" className="cursor-pointer">
                            <FaShoppingCart />
                        </a>
                    </button>
                </div>
            </header>
        </nav>
    );
};

export default Nav;
