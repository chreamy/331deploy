"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import Nav from "@/app/nav";

// function to convert drink name to image file format
function toSnakeCase(str) {
    return str.toLowerCase().replace(/ /g, "-");
}

function formatDrinkName(str) {
    return str
        .split('-') // Split by dashes
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
        .join(' '); // Join with spaces
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
        const rawTotal = cart.reduce((total, item) => {
            return total + (parseFloat(item.totalPrice) || 0);
        }, 0);
        return parseFloat(rawTotal.toFixed(2)); // Ensure final total is also properly rounded
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
        // Calculate and round the totalPrice to 2 decimal places
        const rawTotal = updatedCart[index].drinkPrice * updatedCart[index].quantity;
        updatedCart[index].totalPrice = parseFloat(rawTotal.toFixed(2));

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

             {/* Two Column Layout */}
             <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column - Cart Items */}
                <div className="lg:w-2/3">
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
                                        <h3 className="text-xl text-gray-600 font-semibold">{formatDrinkName(item.drinkName)}</h3>
                                        <h3 className="text-xl text-gray-600 font-semibold">${item.totalPrice}</h3>

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

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-center gap-4">
                        <button
                            onClick={() => router.push("/customer/menu")}
                            className="bg-[#EED9C4] text-black font-semibold px-6 py-3 rounded-lg shadow hover:bg-[#cda37f] transition"
                        >
                            Add More Items
                        </button>
                        <button
                            onClick={() => router.push("/customer/checkout")}
                            className="bg-[#EED9C4] text-black font-semibold px-6 py-3 rounded-lg shadow hover:bg-[#cda37f] transition"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>

                {/* Right Column - When & Where + Checkout Summary */}
                <div className="lg:w-1/3 space-y-6">
                    {/* When & Where Section */}
                    <div className="border border-[#C2A385] rounded-2xl p-6 bg-white shadow-md">
                        <h2 className="text-2xl font-bold mb-4 text-[#3D2B1F]">When & Where to Get It</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-[#3D2B1F]">Pickup Location</h3>
                                <p className="text-gray-600">Sharetea<br />
                                1025 University Dr #105<br />
                                College Station, TX 77840</p>
                                <div className="mt-2">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3434.231156003614!2d-96.3422411!3d30.6240759!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86468377f9f38e97%3A0x2dbdf56bf236f251!2sSharetea!5e0!3m2!1sen!2sus!4v1713298000000!5m2!1sen!2sus"
                                        width="100%"
                                        height="200"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        className="rounded-lg"
                                    ></iframe>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold text-[#3D2B1F]">Pickup Time:</h3>
                                <p className="text-gray-600">Your order will be ready in approximately <strong>15-20 minutes</strong> after checkout.</p>
                                <h3 className="text-lg font-semibold text-[#3D2B1F] mt-2">Store Hours:</h3>
                                <p className="text-gray-600">Monday-Sunday: 11AM - 11PM</p>
                                <h3 className="text-lg font-semibold text-[#3D2B1F] mt-2">Contact:</h3>
                                <p className="text-gray-600">Phone: (979) 330-4078</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}