"use client";
import React, { useState, useEffect } from "react";
import TranslateToggle from "./components/TranslateToggle";
import Link from "next/link";
import { FaHome, FaVolumeUp, FaVolumeMute, FaMicrophone, FaMicrophoneSlash, FaShoppingCart } from "react-icons/fa";
import { useVoiceCommands } from "./components/VoiceCommandProvider";
import AuthButton from "./components/AuthButton";
import { useHighContrast } from "./components/HighContrastContext";

const Nav = ({ userRole }) => {
    const voiceContext = useVoiceCommands();
    const { highContrast, toggleHighContrast } = useHighContrast();
    const [localVoiceEnabled, setLocalVoiceEnabled] = useState(false);
    const [voiceAvailable, setVoiceAvailable] = useState(false);

    useEffect(() => {
        // Check if voice context is available
        setVoiceAvailable(!!voiceContext);
        
        // Initialize voice state from localStorage only if voice is available
        if (voiceContext) {
            const savedVoiceState = localStorage.getItem('voiceEnabled');
            if (savedVoiceState !== null) {
                const isEnabled = savedVoiceState === 'true';
                setLocalVoiceEnabled(isEnabled);
                if (isEnabled !== voiceContext.voiceEnabled) {
                    voiceContext.toggleVoiceEnabled();
                }
            }
        }
    }, [voiceContext]);

    const handleVoiceToggle = () => {
        if (!voiceContext) return;
        
        const newState = !localVoiceEnabled;
        setLocalVoiceEnabled(newState);
        localStorage.setItem('voiceEnabled', newState.toString());
        voiceContext.toggleVoiceEnabled();
    };

    const handleLogout = () => {
        // Clear the cart from localStorage
        localStorage.removeItem("cart");
        // Clear voice state
        localStorage.removeItem("voiceEnabled");
        // Force a full page reload to reset all states
        window.location.href = "/";
    };

    return (
        <nav>
            <header className="w-full border-b p-4 flex items-center justify-between bg-white shadow-sm rounded-lg relative">
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

                    {voiceAvailable && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleVoiceToggle}
                                className={`text-2xl ${localVoiceEnabled ? 'text-blue-500' : 'text-gray-700'} hover:text-blue-500`}
                                title={localVoiceEnabled ? "Disable voice commands" : "Enable voice commands"}
                            >
                                {localVoiceEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                            </button>
                            {localVoiceEnabled && (
                                <button
                                    onClick={voiceContext.toggleListening}
                                    className={`text-2xl ${voiceContext.isListening ? 'text-green-500 animate-pulse' : 'text-gray-700'} hover:text-green-500`}
                                    title={voiceContext.isListening ? "Stop listening" : "Start listening"}
                                >
                                    {voiceContext.isListening ? <FaMicrophone /> : <FaMicrophoneSlash />}
                                </button>
                            )}
                        </div>
                    )}

                    <div className="flex items-center text-grey-700 justify-center h-full mt-0 -mb-2">
                        <TranslateToggle />
                    </div>
                    
                    {userRole != "guest" && (
                        <a href="/">
                            <button      
                                onClick={handleLogout}                   
                                className="bg-black text-white text-lg px-3 py-1 -my-2 rounded-xl hover:bg-gray-800 transition-all"
                                title="Log Off"
                            >
                                Log Off
                            </button>
                        </a>
                    )}
                </div>

                {/* Center Title */}
                <h1 className="absolute left-1/2 transform -translate-x-1/2 text-xl sm:text-2xl font-semibold text-black text-center">
                    {userRole === "customer" && <span>ShareTea Customer Portal</span>}
                    {userRole === "guest" && <span>ShareTea Portal</span>}
                    {userRole === "cashier" && <span>ShareTea Cashier Portal</span>}
                </h1>

                {/* Right Side: Toggle + Cart */}
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center group">
                        <span className="text-xs font-medium text-gray-700 mb-1 group-hover:underline">
                            High Contrast
                        </span>
                        <label
                            className="relative inline-flex items-center cursor-pointer"
                            title="Toggle High Contrast Mode"
                        >
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={highContrast}
                                onChange={toggleHighContrast}
                                aria-label="Toggle High Contrast Mode"
                            />
                            <div
                                className={`w-14 h-7 bg-gray-300 rounded-full peer-checked:bg-yellow-400 transition-colors duration-300 ease-in-out flex items-center relative ${
                                    highContrast ? "justify-end" : "justify-start"
                                } p-1`}
                            >
                                <div
                                    className="w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out peer-checked:translate-x-7"
                                ></div>
                                <span
                                    className={`absolute text-xs font-semibold text-gray-700 ${
                                        highContrast ? "left-2" : "right-2"
                                    }`}
                                >
                                    {highContrast ? "ON" : "OFF"}
                                </span>
                            </div>
                        </label>
                    </div>
                    {userRole === "customer" && (
                        <Link
                            href="/customer/cart"
                            className="text-2xl text-gray-700 hover:text-blue-500 cursor-pointer"
                            title="Cart"
                        >
                            <FaShoppingCart />
                        </Link>
                    )}
                    <AuthButton />
                </div>
            </header>
        </nav>
    );
};

export default Nav;