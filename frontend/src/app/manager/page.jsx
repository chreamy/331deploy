"use client";
import { SERVER } from "@/app/const";
import { useState, useEffect, useRef } from "react";
import Nav from "@/app/nav";
import { Chart } from "chart.js/auto";
import {
    FaChartLine,
    FaGripHorizontal,
    FaHome,
    FaPen,
    FaTrash,
} from "react-icons/fa";
import { Management } from "./management";
import Reports from "./reports";
import Trends from "./trends";

export default function Manager() {
    const [tab, setTab] = useState("management");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="flex absolute inset-0 size-auto">
            <div className={`bg-[#0a0a0a] font-[telegraf] text-white p-4 overflow-auto h-screen`}>
                {/* Menu Toggle Button */}
                <button className="text-4xl p-4 hover:text-red-500">
                    <FaGripHorizontal
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                    />
                </button>

                {/* Menu Buttons */}
                <div className="flex flex-col mt-4 items-start gap-6 w-ful">
                    <a
                        onClick={() => setTab("management")}
                        className="cursor-pointer w-full"
                    >
                        <button className="p-6 flex justify-center w-full border-zinc-200 border rounded-[10px] px-4 bg-blue-900 items-center hover:scale-[1.05] cursor-pointer">
                            <FaHome className="text-3xl" />
                            {isMenuOpen ? (
                                ""
                            ) : (
                                <h3 className="ml-4 text-2xl">Home</h3>
                            )}
                        </button>{" "}
                    </a>

                    <a
                        onClick={() => setTab("report")}
                        className="cursor-pointer w-full"
                    >
                        <button className="p-6 flex w-full border-zinc-200 border rounded-[10px] px-4 bg-blue-900 items-center hover:scale-[1.05] cursor-pointer">
                            <FaPen className="text-3xl" />
                            {isMenuOpen ? (
                                ""
                            ) : (
                                <h3 className="ml-4 text-2xl">Reports</h3>
                            )}
                        </button>
                    </a>
                    <a
                        onClick={() => setTab("trend")}
                        className="cursor-pointer w-full items-center"
                    >
                        <button className="p-6 flex w-full justify-center border-zinc-200 border rounded-[10px] px-4 bg-blue-900 items-center hover:scale-[1.05] cursor-pointer">
                            <FaChartLine className="text-3xl" />
                            {isMenuOpen ? (
                                ""
                            ) : (
                                <h3 className="ml-4 text-2xl">Trends</h3>
                            )}
                        </button>{" "}
                    </a>
                </div>
            </div>
            <div
                className={`w-full ${
                    tab === "management" ? "block" : "hidden"
                }`}
            >
                <Management />
            </div>
            <div className={`w-full ${tab === "report" ? "block" : "hidden"}`}>
                <Reports />
            </div>
            <div className={`w-full ${tab === "trend" ? "block" : "hidden"}`}>
                <Trends />
            </div>
        </div>
    );
}
