"use client";
import { SERVER } from "@/app/const";
import { useState } from "react";
import Nav from "@/app/nav";

export default function Trends() {
    return (
        <div className="overflow-auto h-screen">
            <div className={`flex-1 bg-gradient-to-b from-gray-900 to-gray-700 border-black`}>
                <div className="flex justify-between items-center p-2 bg-white sticky top-0 w-full shadow-md z-50 border-b-black border-b-5">
                    <h1 className="text-3xl text-left font-bold text-black text-center bg-white sticky top-0 w-full">
                        Sales Trends
                    </h1> 
                </div>
            </div>
        </div>
    );
}
