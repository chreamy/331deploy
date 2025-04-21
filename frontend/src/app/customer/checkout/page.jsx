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

    const [selectedTip, setSelectedTip] = useState(null);
    const [customTip, setCustomTip] = useState(null);
    const [tipAmount, setTipAmount] = useState(0);
    const [contactInfo, setContactInfo] = useState({
        phone: '',
        email: '',
        firstName: '',
        lastName: ''
    });

    const handleTipSelect = (tip, isCustom = false) => {
        if (isCustom) {
            setSelectedTip(null);
            setTipAmount(tip);
        } else {
            setSelectedTip(tip);
            setCustomTip(null);
            setTipAmount(calculateTotal() * (tip / 100));
        }
    };

    const handlePlaceOrder = async (cart, customerName) => {    
        const timestamp = new Date().toISOString().slice(0, 19).replace("T", " "); 
    
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
                Checkout
            </h2>

             {/* Three Column Layout */}
             <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column - Cart Items */}
                <div className="lg:w-1/3">
                    <div className="grid grid-cols-1 gap-4">
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
                    </div>
                </div>

                {/* Middle Column - Contact Info */}
                <div className="lg:w-1/3">
                    <div className="border border-[#C2A385] rounded-2xl p-6 bg-white shadow-md">
                        <h2 className="text-2xl font-bold mb-6 text-[#3D2B1F]">CONTACT</h2>
                        
                        <div className="space-y-6">
                            {/* Country Code */}
                            <div className="flex items-center justify-between p-3 bg-[#F5F5F5] rounded-lg">
                                <span className="text-gray-600">Country</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-800 font-medium">+1</span>
                                    <span className="text-gray-800 font-medium">United States</span>
                                </div>
                            </div>
                            
                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Phone number</label>
                                <input
                                    type="number"
                                    placeholder="Enter phone number"
                                    className="w-full py-2 pl-7 pr-3 border border-[#C2A385] rounded-lg focus:outline-none text-gray-600 focus:ring-1 focus:ring-[#3D2B1F]"
                                    value={contactInfo.phone}
                                    onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                                />
                            </div>
                            
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Email address for receipt</label>
                                <input
                                    type="text"
                                    placeholder="Enter email"
                                    className="w-full py-2 pl-7 pr-3 border border-[#C2A385] rounded-lg focus:outline-none text-gray-600 focus:ring-1 focus:ring-[#3D2B1F]"
                                    value={contactInfo.email}
                                    onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                                />
                            </div>
                            
                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">First name</label>
                                    <input
                                        type="text"
                                        placeholder="First Name"
                                        className="w-full py-2 pl-7 pr-3 border border-[#C2A385] rounded-lg focus:outline-none text-gray-600 focus:ring-1 focus:ring-[#3D2B1F]"
                                        value={contactInfo.firstName}
                                        onChange={(e) => setContactInfo({...contactInfo, firstName: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Last name</label>
                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        className="w-full py-2 pl-7 pr-3 border border-[#C2A385] rounded-lg focus:outline-none text-gray-600 focus:ring-1 focus:ring-[#3D2B1F]"
                                        value={contactInfo.lastName}
                                        onChange={(e) => setContactInfo({...contactInfo, lastName: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Checkout Summary */}
                <div className="lg:w-1/3 space-y-6">
                    {/* Checkout Summary Section */}
                    <div className="border border-[#C2A385] rounded-2xl p-6 bg-white shadow-md">
                        <h2 className="text-2xl font-bold mb-4 text-[#3D2B1F]">Order Summary</h2>
                        
                        <div className="space-y-4">
                            {/* Tip Options */}
                            <div>
                                <h3 className="text-lg font-semibold text-[#3D2B1F] mb-2">Add a Tip</h3>
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    {['10%', '15%', '20%'].map((tip) => {
                                        const percentage = parseFloat(tip);
                                        return (
                                            <button 
                                                key={tip}
                                                className={`py-2 rounded-lg transition ${
                                                    selectedTip === percentage 
                                                        ? 'bg-[#3D2B1F] text-[#EED9C4]' 
                                                        : 'bg-[#EED9C4] text-[#3D2B1F] hover:bg-[#cda37f]'
                                                }`}
                                                onClick={() => {
                                                    if (selectedTip === percentage) {
                                                        // If already selected, deselect it
                                                        setSelectedTip(null);
                                                        setTipAmount(0);
                                                    } else {
                                                        // Otherwise select it
                                                        handleTipSelect(percentage);
                                                    }
                                                }}
                                            >
                                                {tip}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">$</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full py-2 pl-7 pr-3 border border-[#C2A385] rounded-lg focus:outline-none text-gray-600 focus:ring-1 focus:ring-[#3D2B1F]"
                                            value={customTip !== null ? customTip : ''}
                                            onChange={(e) => {
                                                const value = parseFloat(e.target.value);
                                                if (!isNaN(value) && value >= 0) {
                                                    setCustomTip(value);
                                                } else if (e.target.value === '') {
                                                    setCustomTip(null);
                                                }
                                            }}
                                        />
                                    </div>
                                    <button 
                                        className="py-2 px-3 bg-[#EED9C4] rounded-lg text-[#3D2B1F] hover:bg-[#cda37f] transition"
                                        onClick={() => customTip !== null && handleTipSelect(customTip, true)}
                                        disabled={customTip === null}
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                            
                            {/* Order Totals */}
                            <div className="space-y-2 pt-4 border-t border-gray-200">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="text-[#3D2B1F] font-medium">${calculateTotal()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="text-[#3D2B1F] font-medium">${(calculateTotal() * 0.08).toFixed(2)}</span>
                                </div>
                                {/* Tip Line - Only shows if tip is selected */}
                                {tipAmount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tip</span>
                                        <span className="text-[#3D2B1F] font-medium">${tipAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 border-t border-gray-200">
                                    <span className="text-lg font-bold text-[#3D2B1F]">Order Total</span>
                                    <span className="text-lg font-bold text-[#3D2B1F]">
                                        ${(parseFloat(calculateTotal()) * 1.08 + tipAmount).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Checkout Button */}
                            <button
                                onClick={() => addOrder()}
                                className="w-full bg-[#3D2B1F] text-[#EED9C4] font-semibold px-6 py-3 rounded-lg shadow hover:bg-[#2a1d15] transition mt-4"
                                disabled={cart.length === 0}
                            >
                                Place Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}