"use client";
import React from "react";
import { useState, useEffect } from "react";
import TranslateToggle from "./components/TranslateToggle";
import Link from "next/link";
import { FaHome, FaVolumeUp, FaShoppingCart } from "react-icons/fa";

const Nav = ({ userRole }) => {
    const handleLogout = () => {
        // Clear the cart from localStorage
        localStorage.removeItem("cart");
        // Clear any other user-related data if needed
        // localStorage.removeItem("authToken");
        
        // Force a full page reload to reset all states
        window.location.href = "/";
    };

    return (
        <nav>
            <header className="w-full flex justify-center items-center border-b p-4 flex items-center justify-between bg-white shadow-sm rounded-lg">
                {/* Left Icons */}
                <div className="flex items-center gap-4">
                    {userRole != "guest" && (
                    <Link 
                        href={userRole === "cashier" ? "/cashier" : "/customer/menu"} 
                        className="text-2xl text-gray-700 hover:text-blue-500 cursor-pointer"
                        title="Home"
                    >
                        <FaHome />
                    </Link>
                )}

                    <button
                        className="text-2xl text-gray-700 hover:text-blue-500"
                        title="Sound"
                    >
                        <FaVolumeUp />
                    </button>
  
                    <div className="flex items-center justify-center h-full">
                        <TranslateToggle />
                    </div>
                    
                    <button
                        onClick={handleLogout}
                        className="bg-black text-white text-lg px-4 py-2 rounded-full hover:bg-gray-800 transition-all"
                        title="Log Off"
                    >
                        Log Off
                    </button>
                </div>
               
                {userRole != "guest" && (
                    <a href="/">
                        <button                         
                            className="bg-black text-white text-lg px-4 py-2 rounded-full hover:bg-gray-800 transition-all"
                            title="Log Off"
                        >
                            Log Off
                        </button>
                    </a>
                )}
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
                    {userRole != "guest" && (
                    <button
                        className="text-2xl text-gray-700 hover:text-blue-500"
                        title="Cart"
                    >
                        <a 
                        href="/customer/cart" 
                        className="text-2xl text-gray-700 hover:text-blue-500 cursor-pointer"
                        title="Cart"
                    >
                        <FaShoppingCart />
                      </a>
                    </button>
                    )}
                </div>
            </header>
        </nav>
    );
};

export default Nav;