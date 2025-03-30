"use client";
import { useState } from "react";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useRouter } from "next/navigation"; // Import useRouter

export default function orderCart() {
  const router = useRouter(); // Initialize router
  // Cart state
  const [cart, setCart] = useState([
    { id: 1, name: "Milk Tea", price: 1000, quantity: 1 },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-700 p-4 md:p-8">
      {/* Back Button */}
          <div className="mt-6">
          <IoArrowBackCircleOutline className="text-3xl cursor-pointer" 
          onClick={() => router.back()} // Navigate back
          />
      </div>
      <div>
        <h1 className="text-white text-3xl font-bold">Your Cart</h1>
        {cart.length === 0 ? (
          <p className="text-white">Cart is empty.</p>
        ) : (
          <p className="text-white">Cart contains {cart.length} item(s).</p>
        )}
      </div>
    </div>
  );
};