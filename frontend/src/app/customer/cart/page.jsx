"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import Nav from "@/app/nav";
import VoiceLayer from "@/app/components/VoiceLayer";
import VoiceElement from "@/app/components/VoiceElement";
import HighContrastWrapper from "@/app/components/HighContrastWrapper";
import { useHighContrast } from "@/app/components/HighContrastContext"; // 👈 important

function toSnakeCase(str) {
    return str.toLowerCase().replace(/ /g, "-");
}

function formatDrinkName(str) {
    return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export default function OrderCart() {
    const router = useRouter();
    const { highContrast } = useHighContrast(); // 👈 important
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(storedCart);
    }, []);

    const calculateTotal = () => {
        const rawTotal = cart.reduce((total, item) => total + (parseFloat(item.totalPrice) || 0), 0);
        return parseFloat(rawTotal.toFixed(2));
    };

    const deleteItem = (index) => {
        const updatedCart = [...cart];
        updatedCart.splice(index, 1);
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    const updateQuantity = (index, change) => {
        const updatedCart = [...cart];
        updatedCart[index].quantity = Math.max(1, updatedCart[index].quantity + change);
        const rawTotal = updatedCart[index].drinkPrice * updatedCart[index].quantity;
        updatedCart[index].totalPrice = parseFloat(rawTotal.toFixed(2));
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    const goBack = () => router.back();
    const navigateToMenu = () => router.push("/customer/menu");
    const navigateToCheckout = () => router.push("/customer/checkout");

    // 🎨 Conditional styles
    const bgColor = highContrast ? "bg-black" : "bg-[#3D2B1F]";
    const textColor = highContrast ? "text-white" : "text-[#EED9C4]";
    const borderColor = highContrast ? "border-orange-400" : "border-[#C2A385]";
    const buttonBg = highContrast ? "bg-orange-400" : "bg-[#EED9C4]";
    const buttonText = highContrast ? "text-black" : "text-[#3D2B1F]";
    const cardBg = highContrast ? "bg-black" : "bg-white";
    const cardText = highContrast ? "text-white" : "text-gray-900";

    return (
        <HighContrastWrapper>
            <VoiceLayer>
                <div className={`min-h-screen font-[telegraf] p-4 md:p-8 ${bgColor} ${textColor}`}>
                    <Nav userRole="customer" />

                    {/* Back Button */}
                    <div className="mt-6">
                        <VoiceElement id="back-button" description="Go back" onClick={goBack}>
                            <IoArrowBackCircleOutline className="text-3xl cursor-pointer" />
                        </VoiceElement>
                    </div>

                    {/* Cart Header */}
                    <h2 className="text-3xl font-extrabold mt-0 mb-6 text-center drop-shadow-md">
                        Your Cart
                    </h2>

                    {/* Two Column Layout */}
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Column */}
                        <div className="lg:w-2/3">
                            <div className="grid grid-cols-1 gap-6">
                                {cart.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`border rounded-2xl p-6 shadow-md hover:shadow-xl transition ${borderColor} ${cardBg} ${cardText}`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <img
                                                src={item.photo || `/drink-images/${toSnakeCase(item.drinkName)}.png`}
                                                alt={item.drinkName}
                                                className="w-24 h-24 object-contain rounded-md"
                                            />

                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold">{formatDrinkName(item.drinkName)}</h3>
                                                <h3 className="text-xl font-semibold">${item.totalPrice}</h3>

                                                {/* Modifications */}
                                                <ul className="mt-2 text-sm">
                                                    {item.selectedIce && <li>Ice Level: {item.selectedIce}</li>}
                                                    {item.selectedSugar && <li>Sugar Level: {item.selectedSugar}</li>}
                                                </ul>

                                                {/* Toppings */}
                                                <div className="mt-3 text-sm">
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
                                                    <p className="text-sm">Quantity:</p>
                                                    <VoiceElement
                                                        id={`decrease-item-${index}`}
                                                        description={`Decrease ${formatDrinkName(item.drinkName)}`}
                                                        onClick={() => updateQuantity(index, -1)}
                                                    >
                                                        <button className={`px-2 py-1 rounded text-sm ${buttonBg} ${buttonText}`}>
                                                            -
                                                        </button>
                                                    </VoiceElement>
                                                    <span className="text-lg font-medium">{item.quantity}</span>
                                                    <VoiceElement
                                                        id={`increase-item-${index}`}
                                                        description={`Increase ${formatDrinkName(item.drinkName)}`}
                                                        onClick={() => updateQuantity(index, 1)}
                                                    >
                                                        <button className={`px-2 py-1 rounded text-sm ${buttonBg} ${buttonText}`}>
                                                            +
                                                        </button>
                                                    </VoiceElement>
                                                </div>
                                            </div>

                                            {/* Delete */}
                                            <VoiceElement
                                                id={`delete-item-${index}`}
                                                description={`Delete ${formatDrinkName(item.drinkName)}`}
                                                onClick={() => deleteItem(index)}
                                            >
                                                <button className="text-red-500 font-bold hover:underline cursor-pointer">
                                                    Delete
                                                </button>
                                            </VoiceElement>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Buttons */}
                            <div className="mt-6 flex justify-center gap-4">
                                <VoiceElement id="add-more-items" description="Add more items" onClick={navigateToMenu}>
                                    <button className={`font-semibold px-6 py-3 rounded-lg shadow hover:opacity-80 ${buttonBg} ${buttonText}`}>
                                        Add More Items
                                    </button>
                                </VoiceElement>
                                <VoiceElement id="proceed-to-checkout" description="Proceed to checkout" onClick={navigateToCheckout}>
                                    <button className={`font-semibold px-6 py-3 rounded-lg shadow hover:opacity-80 ${buttonBg} ${buttonText}`}>
                                        Proceed to Checkout
                                    </button>
                                </VoiceElement>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="lg:w-1/3 space-y-6">
                            <div className={`border rounded-2xl p-6 shadow-md ${borderColor} ${cardBg} ${cardText}`}>
                                <h2 className="text-2xl font-bold mb-4">When & Where to Get It</h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">Pickup Location</h3>
                                        <p>Sharetea<br />1025 University Dr #105<br />College Station, TX 77840</p>
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
                                        <h3 className="text-lg font-semibold">Pickup Time:</h3>
                                        <p>Ready in about <strong>15-20 minutes</strong> after checkout.</p>
                                        <h3 className="text-lg font-semibold mt-2">Store Hours:</h3>
                                        <p>Monday–Sunday: 11AM – 11PM</p>
                                        <h3 className="text-lg font-semibold mt-2">Contact:</h3>
                                        <p>Phone: (979) 330-4078</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </VoiceLayer>
        </HighContrastWrapper>
    );
}
