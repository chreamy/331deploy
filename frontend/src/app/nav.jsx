"use client";
import React from "react";
import { useState } from "react";
import { FaHome, FaVolumeUp, FaShoppingCart, FaLanguage, FaLine, FaChartLine, FaPaperclip, FaPaperPlane, FaRegPaperPlane, FaHandPaper, FaPen, FaGripLines, FaGripHorizontal, FaGratipay } from "react-icons/fa";

const Nav = ({ userRole }) => {
    
    if (userRole === "customer") {
        return (
            <nav>
                <header className="w-full border-b p-4 flex items-center justify-between bg-white shadow-sm">
                {/* Left Icons */}
                <div className="flex items-center gap-4">
                    <button className="text-2xl text-gray-700 hover:text-blue-500 cursor-pointer"
                        title="Home"
                    >
                    <a href="/customer/menu" className="cursor-pointer">
                        <FaHome />
                    </a>
                    </button>
    
                    <button className="text-2xl text-gray-700 hover:text-blue-500"
                        title="Sound"
                    >
                        <FaVolumeUp />
                    </button>
                
                    <button className="text-2xl text-gray-700 hover:text-blue-500"
                        title="Language"
                    >
                        <FaLanguage />
                    </button>
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
    } 

    else if (userRole === "manager") {
        // Menu states for the manager view
        const [isMenuOpen, setIsMenuOpen] = useState(true);
        const toggleManagerMenu = () => {
            setIsMenuOpen(!isMenuOpen);
        };  
        
        return (
            <div className="min-h-screen bg-gray-300 flex">
                {/* Left Sidebar */}
                <div
                    className={`transition-all duration-500 ease-in-out bg-black text-white p-4`}
                >

                {/* Menu Toggle Button */}
                <button
                    className="text-white text-2xl mb-4"
                    onClick={toggleManagerMenu}
                >
                    <FaGripHorizontal className="items-center"/>
                </button>

                {/* Menu Buttons */}
                <div className="flex flex-col items-start gap-6">
                    <button className="flex flex-col items-center text-gray-300 hover:text-blue-500" >
                        <a href="/manager/management" className="cursor-pointer flex items-center">
                            <FaHome className="text-6xl" />
                            {isMenuOpen?"":<h3 className="p-6 text-2xl">Home</h3>}
                        </a>
                    </button>

                    <button className="flex flex-col items-center text-gray-300 hover:text-blue-500" >
                        <a href="/manager/reports" className="cursor-pointer flex items-center">
                            <FaPen className="text-6xl" />
                            {isMenuOpen?"":<h3 className="p-6 text-2xl">Reports</h3>}
                        </a>
                    </button>

                    <button className="flex flex-col items-center text-gray-300 hover:text-blue-500" >
                        <a href="/manager/trends" className="cursor-pointer flex items-center">
                            <FaChartLine className="text-6xl"/>
                            {isMenuOpen?"":<h3 className="p-6 text-2xl">Trends</h3>}
                        </a>
                    </button>
                </div>
            </div>
        </div>
        )
    }

    else if (userRole === "cashier") {

    }
}

export default Nav;