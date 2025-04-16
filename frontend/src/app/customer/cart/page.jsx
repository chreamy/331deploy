"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import Nav from "@/app/nav";

// function to convert drink name to image file format
function toSnakeCase(str) {
    return str.toLowerCase().replace(/ /g, "-");
}

export default function OrderCart() {
    const router = useRouter();

    // Initialize state to hold cart items
    const [cart, setCart] = useState([]);

    // Fetch cart data from localStorage when the component mounts
    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(storedCart);
    }, []);

    // Calculate total price of all items in the cart
    const calculateTotal = () => {
        return cart.reduce((total, item) => {
            return total + (parseFloat(item.totalPrice) || 0);
        }, 0).toFixed(2);
    };

    // Delete item from the cart
    const deleteItem = (index) => {
        const updatedCart = [...cart];
        updatedCart.splice(index, 1); // Remove item from cart at the given index
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart)); // Update localStorage
    };

    // Update item quantity in the cart
    const updateQuantity = (index, change) => {
        const updatedCart = [...cart];
        updatedCart[index].quantity = Math.max(1, updatedCart[index].quantity + change);
        updatedCart[index].totalPrice = updatedCart[index].drinkPrice * updatedCart[index].quantity;
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart)); // Update localStorage
    };

    return (
        <div className="min-h-screen font-[telegraf] p-4 md:p-8 bg-[#3D2B1F]">
            <Nav userRole="customer" />

            {/* Back Button */}
            <div className="mt-6">
                <IoArrowBackCircleOutline
                    className="text-3xl text-[#EED9C4] cursor-pointer"
                    onClick={() => router.back()}
                />
            </div>

            {/* Cart Header */}
            <h2 className="text-3xl font-extrabold mt-0 mb-6 text-center text-[#EED9C4] drop-shadow-md">
                Your Cart
            </h2>

            {/* Items Section */}
            <div className="grid grid-cols-1 gap-6">
                {cart.map((item, index) => (
                    <div
                        key={index}
                        className="border border-[#C2A385] rounded-2xl p-6 bg-white shadow-md hover:shadow-xl transition"
                    >
                        <div className="flex items-center gap-6">
                            <img
                                src={item.photo || `/drink-images/${toSnakeCase(item.drinkName)}.png`} // Default image if none is provided
                                alt={item.drinkName}
                                className="w-24 h-24 object-contain rounded-md"
                            />

                            <div className="flex-1">
                                <h3 className="text-xl text-gray-600 font-semibold">{item.drinkName}</h3>

                                {/* Modifications */}
                                <ul className="mt-2 text-sm text-gray-600">
                                    {item.selectedIce && <li>Ice Level: {item.selectedIce}</li>}
                                    {item.selectedSugar && <li>Sugar Level: {item.selectedSugar}</li>}
                                </ul>

                                {/* Toppings */}
                                <div className="mt-3 text-sm text-gray-600">
                                    <strong>Toppings:</strong>
                                    {item.selectedToppings && item.selectedToppings.length > 0 ? (
                                        <ul className="list-disc list-inside">
                                            {item.selectedToppings.map((top, i) => (
                                                <li key={i}>
                                                    {top.name}: +${(top.price || 0).toFixed(2)}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span> No Toppings (Default)</span>
                                    )}
                                </div>

                                {/* Quantity Controls */}
                                <div className="mt-3 flex items-center gap-3">
                                    <p className="text-sm text-gray-600">Quantity:</p>
                                    <button
                                        className="px-2 py-1 bg-[#EED9C4] rounded text-sm text-gray-600 hover:bg-[#cda37f]"
                                        onClick={() => updateQuantity(index, -1)}
                                    >
                                        -
                                    </button>
                                    <span className="text-lg text-gray-600 font-medium">{item.quantity}</span>
                                    <button
                                        className="px-2 py-1 bg-[#EED9C4] rounded text-sm text-gray-600 hover:bg-[#cda37f]"
                                        onClick={() => updateQuantity(index, 1)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Delete Item Button */}
                            <button
                                className="text-red-500 font-bold hover:underline cursor-pointer"
                                onClick={() => deleteItem(index)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Total Price */}
            <h2 className="text-xl font-bold text-center mt-10 text-[#C2A385]">
                Total: ${calculateTotal()}
            </h2>

            {/* Action Button */}
            <div className="mt-6 flex justify-center">
                <button
                    onClick={() => router.push("/customer/menu")}
                    className="bg-[#EED9C4] text-black font-semibold px-6 py-3 rounded-lg shadow hover:bg-[#cda37f] transition"
                >
                    Add More Items
                </button>
            </div>
        </div>
    );
}
