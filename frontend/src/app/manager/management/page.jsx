"use client";
import { useState } from "react";
import Nav from "@/app/nav";

export default function Management() {

  return (
    <div className="flex">
        <Nav userRole="manager" />
        <div className="bg-white min-h-screen">
			<h1>Management</h1>
        </div>
    </div>
  );
}
