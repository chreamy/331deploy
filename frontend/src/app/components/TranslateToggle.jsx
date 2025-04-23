"use client";

import { useState } from "react";
import { FaLanguage } from "react-icons/fa";

export default function TranslateToggle() {
    const [visible, setVisible] = useState(false);

    const toggleDropdown = () => {
        const elem = document.getElementById("google_translate_element");
        if (elem) {
            const newVisibility = !visible;
            elem.classList.toggle("show", newVisibility);
            setVisible(newVisibility);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={toggleDropdown}
                className="text-2xl text-gray-700 hover:text-blue-500"
                title="Translate"
            >
                <FaLanguage />
            </button>

            {/* Translate dropdown */}
            <div
                id="google_translate_element"
                className={`absolute top-10 left-0 z-50 bg-white p-2 rounded shadow ${
                    visible ? "" : "hidden"
                }`}
            ></div>
        </div>
    );
}
