"use client";
import { SERVER } from "@/app/const";
import { useState } from "react";
import Nav from "@/app/nav";

export default function ManagerReport() {

    return (
    	<div className="flex w-screen">
        	<Nav userRole="manager"/>
        	<div className={`flex-1 bg-gradient-to-b from-gray-900 to-gray-700 border-l-6 border-black`}>
				<h1 className="text-3xl text-left font-bold text-black p-4 text-center bg-neutral-400">
                	Manage Reports
            	</h1>
  			</div>
    	</div>
  	);
}
