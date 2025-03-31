"use client";
import React from "react";
import { FaHome, FaVolumeUp, FaShoppingCart, FaLanguage } from "react-icons/fa";

const Nav = () => {
    return (
        <header className="nav-header">
            {/* Left Icons */}
            <div className="nav-left">
                <button className="nav-button" title="Home">
                    <a href="/customer/menu">
                        <FaHome />
                    </a>
                </button>

                <button className="nav-button" title="Sound">
                    <FaVolumeUp />
                </button>
                <button className="nav-button" title="Language">
                    <FaLanguage />
                </button>
            </div>

            <h1 className="nav-title">ShareTea Customer Portal</h1>

            {/* Right Side: Toggle + Cart */}
            <div className="nav-right">
                <label className="toggle-switch">
                    <input type="checkbox" />
                    <div></div>
                </label>

                <button className="nav-button" title="Cart">
                    <a href="/customer/cart">
                        <FaShoppingCart />
                    </a>
                </button>
            </div>
        </header>
    );
};

export default Nav;