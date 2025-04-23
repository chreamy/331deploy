"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SERVER } from "@/app/const";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import Nav from "@/app/nav";
import VoiceElement from "@/app/components/VoiceElement";
import { useVoiceCommands } from "@/app/components/VoiceCommandProvider";

// function to convert drink name to image file format
function toSnakeCase(str) {
    return str.toLowerCase().replace(/ /g, "-");
}

function formatDrinkName(str) {
    return str
        .split('-') 
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
        .join(' '); // Join with spaces
}

export default function OrderCart() {
    const router = useRouter();
    const { isListening, lastCommand } = useVoiceCommands();
    const [cart, setCart] = useState([]);
    const [activeField, setActiveField] = useState(null);
    const inputRefs = {
        phone: useRef(null),
        email: useRef(null),
        firstName: useRef(null),
        lastName: useRef(null)
    };
    const [orderComplete, setorderComplete] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

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

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const custName = capitalizeFirstLetter(contactInfo.firstName) + " " + capitalizeFirstLetter(contactInfo.lastName);

    const addOrder = async () => {    
        // Validate fields
        const errors = {};
        if (!contactInfo.phone) errors.phone = 'Phone number is required';
        if (!contactInfo.email) errors.email = 'Email is required';
        if (!contactInfo.firstName) errors.firstName = 'First name is required';
        if (!contactInfo.lastName) errors.lastName = 'Last name is required';
    
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }
    
        try {
            const response = await fetch(`${SERVER}/newOrder`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    customerName: custName,
                    cart: cart
                })
            });
        
            if (!response.ok) {
                throw new Error("Failed to add order");
            }
            setCart([]);
            localStorage.setItem("cart", JSON.stringify([]));
            setShowSuccessModal(true);
            setorderComplete(true);
    
        } catch (error) {
            console.error("Failed to add order", error);
        }
    };
    
    // Add this function to handle input changes
    const handleInputChange = (field, value) => {
        setContactInfo(prev => ({
            ...prev,
            [field]: value
        }));
    };
    
    return (
        <div className="min-h-screen font-[telegraf] p-4 md:p-8 bg-[#3D2B1F]">
            <Nav userRole="customer" />

            {/* Back Button */}
            <VoiceElement
                id="back-button"
                description="go back"                
                onClick={() => router.back()}
            >
                <div className="mt-6">
                    <IoArrowBackCircleOutline
                        className="text-3xl text-[#EED9C4] cursor-pointer"
                    />
                </div>
            </VoiceElement>

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
                            <VoiceElement
                                key={index}
                                id={`cart-item-${index}`}
                                description={`${item.drinkName} quantity ${item.quantity}`}
                                className="border border-[#C2A385] rounded-2xl p-6 bg-white shadow-md hover:shadow-xl transition"
                            >
                                <div className="flex items-center gap-6">
                                    <img
                                        src={item.photo || `/drink-images/${toSnakeCase(item.drinkName)}.png`}
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
                                            <VoiceElement
                                                id={`decrease-${index}`}
                                                description={`decrease ${item.drinkName} quantity`}
                                                onClick={() => updateQuantity(index, -1)}
                                            >
                                                <button className="px-2 py-1 bg-[#EED9C4] rounded text-sm text-gray-600 hover:bg-[#cda37f]">
                                                    -
                                                </button>
                                            </VoiceElement>
                                            <span className="text-lg text-gray-600 font-medium">{item.quantity}</span>
                                            <VoiceElement
                                                id={`increase-${index}`}
                                                description={`increase ${item.drinkName} quantity`}
                                                onClick={() => updateQuantity(index, 1)}
                                            >
                                                <button className="px-2 py-1 bg-[#EED9C4] rounded text-sm text-gray-600 hover:bg-[#cda37f]">
                                                    +
                                                </button>
                                            </VoiceElement>
                                        </div>
                                    </div>

                                    {/* Delete Item Button */}
                                    <VoiceElement
                                        id={`delete-${index}`}
                                        description={`delete ${item.drinkName}`}
                                        onClick={() => deleteItem(index)}
                                    >
                                        <button className="text-red-500 font-bold hover:underline cursor-pointer">
                                            Delete
                                        </button>
                                    </VoiceElement>
                                </div>
                            </VoiceElement>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-center gap-4">
                        <VoiceElement
                            id="add-more-items"
                            description="add more items"
                            onClick={() => router.push("/customer/menu")}
                        >
                            <button className="bg-[#EED9C4] text-black font-semibold px-6 py-3 rounded-lg shadow hover:bg-[#cda37f] transition">
                                Add More Items
                            </button>
                        </VoiceElement>
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
                            <VoiceElement
                                id="phone-change"
                                description="phone number"
                                isInput={true}
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Phone number</label>
                                    <input
                                        type="tel"
                                        placeholder="Enter phone number"
                                        className={`w-full py-2 pl-7 pr-3 border ${
                                            validationErrors.phone ? 'border-red-500' : 'border-[#C2A385]'
                                        } rounded-lg focus:outline-none text-gray-600 focus:ring-1 focus:ring-[#3D2B1F]`}
                                        value={contactInfo.phone}
                                        onChange={(e) => {
                                            handleInputChange('phone', e.target.value);
                                            // Clear validation error when typing
                                            if (validationErrors.phone) {
                                                setValidationErrors(prev => ({...prev, phone: undefined}));
                                            }
                                        }}
                                    />
                                    {validationErrors.phone && (
                                        <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                                    )}
                                </div>
                            </VoiceElement>
                            
                            {/* Email */}
                            <VoiceElement
                                id="email-input"
                                description="email"
                                isInput={true}
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Email address for receipt</label>
                                    <input
                                        type="email"
                                        placeholder="Enter email"
                                        className={`w-full py-2 pl-7 pr-3 border ${
                                            validationErrors.email ? 'border-red-500' : 'border-[#C2A385]'
                                        } rounded-lg focus:outline-none text-gray-600 focus:ring-1 focus:ring-[#3D2B1F]`}
                                        value={contactInfo.email}
                                        onChange={(e) => {
                                            handleInputChange('email', e.target.value);
                                            // Clear validation error when typing
                                            if (validationErrors.email) {
                                                setValidationErrors(prev => ({...prev, email: undefined}));
                                            }
                                        }}
                                    />
                                    {validationErrors.email && (
                                        <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                                    )}
                                </div>
                            </VoiceElement>
                            
                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <VoiceElement
                                    id="first-name-input"
                                    description="first name"
                                    isInput={true}
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">First name</label>
                                        <input
                                            type="text"
                                            placeholder="First Name"
                                            className={`w-full py-2 pl-7 pr-3 border ${
                                                validationErrors.firstName ? 'border-red-500' : 'border-[#C2A385]'
                                            } rounded-lg focus:outline-none text-gray-600 focus:ring-1 focus:ring-[#3D2B1F]`}
                                            value={contactInfo.firstName}
                                            onChange={(e) => {
                                                handleInputChange('firstName', e.target.value);
                                                // Clear validation error when typing
                                                if (validationErrors.firstName) {
                                                    setValidationErrors(prev => ({...prev, firstName: undefined}));
                                                }
                                            }}
                                        />
                                        {validationErrors.firstName && (
                                            <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>
                                        )}
                                    </div>
                                </VoiceElement>
                                <VoiceElement
                                    id="last-name-input"
                                    description="last name"
                                    isInput={true}
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Last name</label>
                                        <input
                                            type="text"
                                            placeholder="Last Name"
                                            className={`w-full py-2 pl-7 pr-3 border ${
                                                validationErrors.lastName ? 'border-red-500' : 'border-[#C2A385]'
                                            } rounded-lg focus:outline-none text-gray-600 focus:ring-1 focus:ring-[#3D2B1F]`}
                                            value={contactInfo.lastName}
                                            onChange={(e) => {
                                                handleInputChange('lastName', e.target.value);
                                                // Clear validation error when typing
                                                if (validationErrors.lastName) {
                                                    setValidationErrors(prev => ({...prev, lastName: undefined}));
                                                }
                                            }}
                                        />
                                        {validationErrors.lastName && (
                                            <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>
                                        )}
                                    </div>
                                </VoiceElement>
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
                                            <VoiceElement
                                                key={tip}
                                                id={`tip-${tip}`}
                                                description={`${tip}`}
                                                onClick={() => {
                                                    if (selectedTip === percentage) {
                                                        setSelectedTip(null);
                                                        setTipAmount(0);
                                                    } else {
                                                        handleTipSelect(percentage);
                                                    }
                                                }}className={`py-2 flex justify-center items-center cursor-pointer rounded-lg transition ${
                                                        selectedTip === percentage 
                                                            ? 'bg-[#3D2B1F] text-[#EED9C4]' 
                                                            : 'bg-[#EED9C4] text-[#3D2B1F] hover:bg-[#cda37f]'
                                                    }`}
                                            >
                                                <button 
                                                className="text-center"    
                                                >
                                                    {tip}
                                                </button>
                                            </VoiceElement>
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
                                    <VoiceElement
                                        id="apply-custom-tip"
                                        description="apply custom tip"
                                        onClick={() => customTip !== null && handleTipSelect(customTip, true)}
                                    >
                                        <button 
                                            className="py-2 px-3 bg-[#EED9C4] rounded-lg text-[#3D2B1F] hover:bg-[#cda37f] transition"
                                            disabled={customTip === null}
                                        >
                                            Apply
                                        </button>
                                    </VoiceElement>
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
                            <VoiceElement
                                id="place-order"
                                description="place order"
                                className="w-full bg-[#3D2B1F] text-[#EED9C4] font-semibold px-6 py-3 rounded-lg shadow hover:bg-[#2a1d15] transition mt-4"
                                disabled={cart.length === 0}
                                onClick={addOrder}
                            >
                                <button
                                    className="w-full bg-[#3D2B1F] text-[#EED9C4] font-semibold px-6 py-3 rounded-lg shadow hover:bg-[#2a1d15] transition mt-4"
                                    disabled={cart.length === 0}
                                >
                                    {cart.length === 0 ? 'Your cart is empty' : 'Place Order'}
                                </button>
                            </VoiceElement>
                        </div>
                    </div>
                </div>
            </div>
            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl max-w-md w-full">
                        <h3 className="text-2xl font-bold text-[#3D2B1F] mb-4">Order Placed Successfully! 🎉</h3>
                        <p className="text-gray-600 mb-6">
                            Thank you, {custName}! Your order has been placed successfully.
                        </p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    router.push("/customer/menu");
                                }}
                                className="bg-[#3D2B1F] text-[#EED9C4] font-semibold px-4 py-2 rounded-lg hover:bg-[#2a1d15] transition"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}