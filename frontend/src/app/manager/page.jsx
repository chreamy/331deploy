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
    FaArrowAltCircleLeft,
} from "react-icons/fa";
import { Management } from "./management";
import Reports from "./reports";
import Trends from "./trends";

export default function Manager() {
    const [tab, setTab] = useState("management");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="flex absolute inset-0 size-auto">
            <div className={`bg-white font-[telegraf] text-white p-4 overflow-auto h-screen`}>
                {/* Menu Toggle Button */}
                <button className="text-4xl p-4 hover:scale-[1.4] cursor-pointer">
                    <FaGripHorizontal
                        onClick={() => setIsMenuOpen((prev) => !prev)} style={{ color: 'black' }}
                    />
                </button>

                {/* Menu Buttons */}
                <div className="flex flex-col mt-4 items-start gap-6 w-ful">
                    <a
                        onClick={() => setTab("management")}
                        className="cursor-pointer w-full"
                    >
                        <button className="p-6 flex justify-center w-full border-zinc-200 border rounded-[10px] px-4 bg-[#EED9C4] items-center hover:scale-[1.1] cursor-pointer">
                            <FaHome className="text-3xl w-20 text-left" style={{ color: 'black' }}/>
                            {isMenuOpen ? (
                                ""
                            ) : (
                                <h3 className="ml-4 text-2xl w-full text-black font-bold">Home</h3>
                            )}
                        </button>{" "}
                    </a>

                    <a
                        onClick={() => setTab("report")}
                        className="cursor-pointer w-full"
                    >
                        <button className="p-6 flex w-full border-zinc-200 border rounded-[10px] px-4 bg-[#EED9C4] items-center hover:scale-[1.1] cursor-pointer">
                            <FaPen className="text-3xl w-20 text-left" style={{ color: 'black'}}/>
                            {isMenuOpen ? (
                                ""
                            ) : (
                                <h3 className="ml-4 text-2xl w-full text-black font-bold">Reports</h3>
                            )}
                        </button>
                    </a>
                    <a
                        onClick={() => setTab("trend")}
                        className="cursor-pointer w-full items-center"
                    >
                        <button className="p-6 flex w-full justify-center border-zinc-200 border rounded-[10px] px-4 bg-[#EED9C4] items-center hover:scale-[1.1] cursor-pointer">
                            <FaChartLine className="text-3xl w-20" style={{ color: 'black' }} />
                            {isMenuOpen ? (
                                ""
                            ) : (
                                <h3 className="ml-4 text-2xl w-full text-black font-bold">Trends</h3>
                            )}
                        </button>{" "}
                    </a>
                    <a
                        href="/"
                        className="cursor-pointer w-full"
                    >
                        <button className="p-6 flex w-full border-zinc-200 border rounded-[10px] px-4 bg-[#EED9C4] items-center hover:scale-[1.1] cursor-pointer">
                            <FaArrowAltCircleLeft className="text-3xl w-20 text-left" style={{ color: 'black' }}/>
                            {isMenuOpen ? (
                                ""
                            ) : (
                                <h3 className="ml-4 text-2xl w-full text-black font-bold">Log Off</h3>
                            )}
                        </button>
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
