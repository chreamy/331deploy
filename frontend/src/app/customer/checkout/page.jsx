"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SERVER } from "@/app/const";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import Nav from "@/app/nav";
import VoiceElement from "@/app/components/VoiceElement";
import { useVoiceCommands } from "@/app/components/VoiceCommandProvider";
import HighContrastWrapper from "@/app/components/HighContrastWrapper";
import { useHighContrast } from "@/app/components/HighContrastContext";

// function to convert drink name to image file format
function toSnakeCase(str) {
    return str.toLowerCase().replace(/ /g, "-");
}

function formatDrinkName(str) {
    return str
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
        .join(" "); // Join with spaces
}

export default function OrderCart() {
    const router = useRouter();
    const { isListening, lastCommand, setActiveInputField } = useVoiceCommands();
    const [cart, setCart] = useState([]);
    const { highContrast } = useHighContrast();
    const [validationErrors, setValidationErrors] = useState({});
    const [orderComplete, setorderComplete] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedTip, setSelectedTip] = useState(null);
    const [customTip, setCustomTip] = useState(null);
    const [tipAmount, setTipAmount] = useState(0);
    const [contactInfo, setContactInfo] = useState({
        phone: "",
        email: "",
        firstName: "",
        lastName: ""
    });

    // Use refs as the source of truth for input values
    const inputRefs = {
        phone: useRef(null),
        email: useRef(null),
        firstName: useRef(null),
        lastName: useRef(null)
    };

    // Function to get current contact info from refs
    const getContactInfo = () => ({
        phone: inputRefs.phone.current?.value || '',
        email: inputRefs.email.current?.value || '',
        firstName: inputRefs.firstName.current?.value || '',
        lastName: inputRefs.lastName.current?.value || ''
    });

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
        updatedCart[index].quantity = Math.max(
            1,
            updatedCart[index].quantity + change
        );
        // Calculate and round the totalPrice to 2 decimal places
        const rawTotal =
            updatedCart[index].drinkPrice * updatedCart[index].quantity;
        updatedCart[index].totalPrice = parseFloat(rawTotal.toFixed(2));

        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart)); // Update localStorage
    };

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

    const custName = () => {
        const info = getContactInfo();
        return `${capitalizeFirstLetter(info.firstName || '')} ${capitalizeFirstLetter(info.lastName || '')}`.trim();
    };

    // Handle voice input changes
    useEffect(() => {
        if (lastCommand && lastCommand.startsWith('input ')) {
            const value = lastCommand.slice(6).trim();
            console.log('Voice command value:', value);
            
            // The active field is already being tracked by VoiceCommandProvider
            // The input will be updated through the onChange event
        }
    }, [lastCommand]);

    // Handle manual input changes
    const handleInputChange = (field, value) => {
        console.log('handleInputChange called:', { field, value });
        console.log('Current contactInfo:', contactInfo);
        
        // Format phone numbers to remove spaces and non-numeric characters
        let formattedValue = value;
        if (field === 'phone') {
            formattedValue = value.replace(/[^0-9]/g, '');
            console.log('Formatted phone number:', formattedValue);
        }
        
        setContactInfo(prev => {
            const newState = {
                ...prev,
                [field]: formattedValue
            };
            console.log('Setting new contactInfo:', newState);
            return newState;
        });
        
        // Clear validation error if it exists
        if (validationErrors[field]) {
            console.log('Clearing validation error for:', field);
            setValidationErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    // Handle input focus
    const handleInputFocus = (field) => {
        console.log('Focus handler called for:', field);
        const voiceElementId = `${field}-input`;
        console.log('Setting active field to:', voiceElementId);
        setActiveInputField(voiceElementId);
    };

    const addOrder = async () => {
        // Validate fields
        const errors = {};
        if (!contactInfo.phone) errors.phone = "Phone number is required";
        if (!contactInfo.email) errors.email = "Email is required";
        if (!contactInfo.firstName) errors.firstName = "First name is required";
        if (!contactInfo.lastName) errors.lastName = "Last name is required";

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
                    customerName: custName(),
                    cart: cart,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to add order");
            }
            setCart([]);
            localStorage.setItem("cart", JSON.stringify([]));
            setShowSuccessModal(true);
            setorderComplete(true);
            handleReset();
        } catch (error) {
            console.error("Failed to add order", error);
        }
    };

    const handleReset = () => {
        setTimeout(() => {
            router.push("/customer/menu");
        }, 7000);
    };

    // const borderColor = highContrast ? "border-orange-400" : "border-[#C2A385]";

    return (
        <HighContrastWrapper>
        <div className="min-h-screen font-[telegraf] p-4 md:p-8" 
            style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
            <Nav userRole="customer" />

            {/* Back Button */}
            <VoiceElement
                id="back-button"
                description="go back"
                onClick={() => router.back()}
            >
                <div className="mt-6">
                    <IoArrowBackCircleOutline className="text-3xl cursor-pointer" />
                </div>
            </VoiceElement>

            {/* Cart Header */}
            <h2 className="text-3xl font-extrabold mt-0 mb-6 text-center drop-shadow-md">
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
                                className={`border rounded-2xl p-6 shadow-md hover:shadow-xl transition ${
                                    highContrast ? "border-yellow-300" : "border-[#C2A385]"
                                } ${highContrast ? "" : "bg-white"}`}
                                style={{
                                    borderColor: highContrast ? "var(--border)" : "#C2A385",
                                    backgroundColor: highContrast ? "var(--background)" : "#ffffff",
                                    color: highContrast ? "var(--foreground)" : "#4B5563" // text-gray-600
                                }}
                            >
                                <div className="flex items-center gap-6">
                                    <img
                                        src={
                                            item.photo ||
                                            `/drink-images/${toSnakeCase(item.drinkName)}.png`
                                        }
                                        alt={item.drinkName}
                                        className="w-24 h-24 object-contain rounded-md"
                                    />

                                    <div className="flex-1">
                                        <h3
                                            className={`text-xl font-semibold ${
                                                highContrast ? "" : "text-gray-600"
                                            }`}
                                        >
                                            {formatDrinkName(item.drinkName)}
                                        </h3>
                                        <h3
                                            className={`text-xl font-semibold ${
                                                highContrast ? "" : "text-gray-600"
                                            }`}
                                        >
                                            ${item.totalPrice}
                                        </h3>

                                        {/* Modifications */}
                                        <ul
                                            className={`mt-2 text-sm ${
                                                highContrast ? "" : "text-gray-600"
                                            }`}
                                        >
                                            {item.selectedIce && (
                                                <li>Ice Level: {item.selectedIce}</li>
                                            )}
                                            {item.selectedSugar && (
                                                <li>Sugar Level: {item.selectedSugar}</li>
                                            )}
                                        </ul>

                                        {/* Toppings */}
                                        <div
                                            className={`mt-3 text-sm ${
                                                highContrast ? "" : "text-gray-600"
                                            }`}
                                        >
                                            <strong>Toppings:</strong>
                                            {item.selectedToppings &&
                                            item.selectedToppings.length > 0 ? (
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
                                            <p
                                                className={`text-sm ${
                                                    highContrast ? "" : "text-gray-600"
                                                }`}
                                            >
                                                Quantity:
                                            </p>
                                            <VoiceElement
                                                id={`decrease-${index}`}
                                                description={`decrease ${item.drinkName} quantity`}
                                                onClick={() => updateQuantity(index, -1)}
                                            >
                                                <button
                                                    className={`px-2 py-1 rounded text-sm ${
                                                        highContrast
                                                            ? "bg-yellow-300 text-black hover:bg-yellow-400"
                                                            : "bg-[#EED9C4] text-gray-600 hover:bg-[#cda37f]"
                                                    }`}
                                                >
                                                    -
                                                </button>
                                            </VoiceElement>
                                            <span
                                                className={`text-lg font-medium ${
                                                    highContrast ? "" : "text-gray-600"
                                                }`}
                                            >
                                                {item.quantity}
                                            </span>
                                            <VoiceElement
                                                id={`increase-${index}`}
                                                description={`increase ${item.drinkName} quantity`}
                                                onClick={() => updateQuantity(index, 1)}
                                            >
                                                <button
                                                    className={`px-2 py-1 rounded text-sm ${
                                                        highContrast
                                                            ? "bg-yellow-300 text-black hover:bg-yellow-400"
                                                            : "bg-[#EED9C4] text-gray-600 hover:bg-[#cda37f]"
                                                    }`}
                                                >
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
                                        <button
                                            className={`font-bold hover:underline cursor-pointer ${
                                                highContrast ? "text-yellow-200" : "text-red-500"
                                            }`}
                                        >
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
                            <button
                                className={`font-semibold px-6 py-3 rounded-lg shadow transition transform hover:scale-105 ${
                                    highContrast
                                        ? "bg-yellow-300 text-black hover:bg-yellow-400"
                                        : "bg-[#EED9C4] text-black hover:bg-[#cda37f]"
                                }`}
                            >
                                Add More Items
                            </button>
                        </VoiceElement>
                    </div>
                </div>

                {/* Middle Column - Contact Info */}
                <div className="lg:w-1/3">
                    <div
                        className={`border rounded-2xl p-6 shadow-md ${
                            highContrast ? "border-yellow-300" : "border-[#C2A385] bg-white"
                        }`}
                        style={{
                            borderColor: highContrast ? "border-yellow-300" : "#C2A385",
                            backgroundColor: highContrast ? "var(--background)" : "#ffffff",
                        }}
                    >
                        <h2
                            className={`text-2xl font-bold mb-6 ${
                                highContrast ? "" : "text-[#3D2B1F]"
                            }`}
                            style={{ color: highContrast ? "var(--foreground)" : "#3D2B1F" }}
                        >
                            CONTACT
                        </h2>

                        <div className="space-y-6">
                            {/* Country Code */}
                            <div
                                className={`flex items-center justify-between p-3 rounded-lg ${
                                    highContrast ? "bg-orange-500" : "bg-[#F5F5F5]"
                                }`}
                            >
                                <span
                                    className={highContrast ? "" : "text-gray-600"}
                                    style={{ color: highContrast ? "var(--foreground)" : "#4B5563" }}
                                >
                                    Country
                                </span>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`font-medium ${
                                            highContrast ? "" : "text-gray-800"
                                        }`}
                                        style={{
                                            color: highContrast ? "var(--foreground)" : "#1F2937",
                                        }}
                                    >
                                        +1
                                    </span>
                                    <span
                                        className={`font-medium ${
                                            highContrast ? "" : "text-gray-800"
                                        }`}
                                        style={{
                                            color: highContrast ? "var(--foreground)" : "#1F2937",
                                        }}
                                    >
                                        United States
                                    </span>
                                </div>
                            </div>

                            {/* Phone Number */}
                            <VoiceElement
                                id="phone-input"
                                description="phone number"
                                isInput={true}
                            >
                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-1 ${
                                            highContrast ? "" : "text-gray-600"
                                        }`}
                                        style={{
                                            color: highContrast ? "var(--foreground)" : "#4B5563",
                                        }}
                                    >
                                        Phone number
                                    </label>
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        placeholder="Enter phone number"
                                        className={`w-full py-2 pl-7 pr-3 border ${
                                            validationErrors.phone
                                                ? "border-red-500"
                                                : highContrast
                                                ? "border-orange-400"
                                                : "border-[#C2A385]"
                                        } rounded-lg focus:outline-none ${
                                            highContrast ? "" : "text-gray-600"
                                        } focus:ring-1 focus:ring-[#3D2B1F]`}
                                        value={contactInfo.phone}
                                        onChange={(e) => {
                                            console.log("Phone input onChange event:", e.target.value);
                                            handleInputChange("phone", e.target.value);
                                        }}
                                        onFocus={(e) => {
                                            console.log("Phone input focused");
                                            handleInputFocus("phone");
                                        }}
                                        style={{
                                            borderColor: validationErrors.phone
                                                ? "#EF4444"
                                                : highContrast
                                                ? "var(--border)"
                                                : "#C2A385",
                                            color: highContrast ? "var(--foreground)" : "#4B5563",
                                        }}
                                    />
                                    {validationErrors.phone && (
                                        <p
                                            className={`text-xs mt-1 ${
                                                highContrast ? "text-red-400" : "text-red-500"
                                            }`}
                                        >
                                            {validationErrors.phone}
                                        </p>
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
                                    <label
                                        className={`block text-sm font-medium mb-1 ${
                                            highContrast ? "" : "text-gray-600"
                                        }`}
                                        style={{
                                            color: highContrast ? "var(--foreground)" : "#4B5563",
                                        }}
                                    >
                                        Email address for receipt
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Enter email"
                                        className={`w-full py-2 pl-7 pr-3 border ${
                                            validationErrors.email
                                                ? "border-red-500"
                                                : highContrast
                                                ? "border-orange-400"
                                                : "border-[#C2A385]"
                                        } rounded-lg focus:outline-none ${
                                            highContrast ? "" : "text-gray-600"
                                        } focus:ring-1 focus:ring-[#3D2B1F]`}
                                        value={contactInfo.email}
                                        onChange={(e) => {
                                            console.log("Email input onChange event:", e.target.value);
                                            handleInputChange("email", e.target.value);
                                        }}
                                        onFocus={(e) => {
                                            console.log("Email input focused");
                                            handleInputFocus("email");
                                        }}
                                        style={{
                                            borderColor: validationErrors.email
                                                ? "#EF4444"
                                                : highContrast
                                                ? "var(--border)"
                                                : "#C2A385",
                                            color: highContrast ? "var(--foreground)" : "#4B5563",
                                        }}
                                    />
                                    {validationErrors.email && (
                                        <p
                                            className={`text-xs mt-1 ${
                                                highContrast ? "text-red-400" : "text-red-500"
                                            }`}
                                        >
                                            {validationErrors.email}
                                        </p>
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
                                        <label
                                            className={`block text-sm font-medium mb-1 ${
                                                highContrast ? "" : "text-gray-600"
                                            }`}
                                            style={{
                                                color: highContrast ? "var(--foreground)" : "#4B5563",
                                            }}
                                        >
                                            First name
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="First Name"
                                            className={`w-full py-2 pl-7 pr-3 border ${
                                                validationErrors.firstName
                                                    ? "border-red-500"
                                                    : highContrast
                                                    ? "border-orange-400"
                                                    : "border-[#C2A385]"
                                            } rounded-lg focus:outline-none ${
                                                highContrast ? "" : "text-gray-600"
                                            } focus:ring-1 focus:ring-[#3D2B1F]`}
                                            value={contactInfo.firstName}
                                            onChange={(e) => {
                                                console.log(
                                                    "First name input onChange event:",
                                                    e.target.value
                                                );
                                                handleInputChange("firstName", e.target.value);
                                            }}
                                            onFocus={(e) => {
                                                console.log("First name input focused");
                                                handleInputFocus("firstName");
                                            }}
                                            style={{
                                                borderColor: validationErrors.firstName
                                                    ? "#EF4444"
                                                    : highContrast
                                                    ? "var(--border)"
                                                    : "#C2A385",
                                                color: highContrast ? "var(--foreground)" : "#4B5563",
                                            }}
                                        />
                                        {validationErrors.firstName && (
                                            <p
                                                className={`text-xs mt-1 ${
                                                    highContrast ? "text-red-400" : "text-red-500"
                                                }`}
                                            >
                                                {validationErrors.firstName}
                                            </p>
                                        )}
                                    </div>
                                </VoiceElement>
                                <VoiceElement
                                    id="last-name-input"
                                    description="last name"
                                    isInput={true}
                                >
                                    <div>
                                        <label
                                            className={`block text-sm font-medium mb-1 ${
                                                highContrast ? "" : "text-gray-600"
                                            }`}
                                            style={{
                                                color: highContrast ? "var(--foreground)" : "#4B5563",
                                            }}
                                        >
                                            Last name
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Last Name"
                                            className={`w-full py-2 pl-7 pr-3 border ${
                                                validationErrors.lastName
                                                    ? "border-red-500"
                                                    : highContrast
                                                    ? "border-orange-400"
                                                    : "border-[#C2A385]"
                                            } rounded-lg focus:outline-none ${
                                                highContrast ? "" : "text-gray-600"
                                            } focus:ring-1 focus:ring-[#3D2B1F]`}
                                            value={contactInfo.lastName}
                                            onChange={(e) => {
                                                console.log(
                                                    "Last name input onChange event:",
                                                    e.target.value
                                                );
                                                handleInputChange("lastName", e.target.value);
                                            }}
                                            onFocus={(e) => {
                                                console.log("Last name input focused");
                                                handleInputFocus("lastName");
                                            }}
                                            style={{
                                                borderColor: validationErrors.lastName
                                                    ? "#EF4444"
                                                    : highContrast
                                                    ? "var(--border)"
                                                    : "#C2A385",
                                                color: highContrast ? "var(--foreground)" : "#4B5563",
                                            }}
                                        />
                                        {validationErrors.lastName && (
                                            <p
                                                className={`text-xs mt-1 ${
                                                    highContrast ? "text-red-400" : "text-red-500"
                                                }`}
                                            >
                                                {validationErrors.lastName}
                                            </p>
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
                    <div
                        className={`border rounded-2xl p-6 shadow-md ${
                            highContrast ? "border-yellow-300" : "border-[#C2A385] bg-white"
                        }`}
                        style={{
                            borderColor: highContrast ? "border-yellow-300" : "#C2A385",
                            backgroundColor: highContrast ? "var(--background)" : "#ffffff",
                        }}
                    >
                        <h2
                            className={`text-2xl font-bold mb-4 ${
                                highContrast ? "" : "text-[#3D2B1F]"
                            }`}
                            style={{ color: highContrast ? "var(--foreground)" : "#3D2B1F" }}
                        >
                            Order Summary
                        </h2>

                        <div className="space-y-4">
                            {/* Tip Options */}
                            <div>
                                <h3
                                    className={`text-lg font-semibold mb-2 ${
                                        highContrast ? "" : "text-[#3D2B1F]"
                                    }`}
                                    style={{ color: highContrast ? "var(--foreground)" : "#3D2B1F" }}
                                >
                                    Add a Tip
                                </h3>
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    {["10%", "15%", "20%"].map((tip) => {
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
                                                }}
                                                className={`py-2 flex justify-center items-center cursor-pointer rounded-lg transition ${
                                                    selectedTip === percentage
                                                        ? highContrast
                                                            ? "bg-yellow-300 text-black"
                                                            : "bg-[#3D2B1F] text-[#EED9C4]"
                                                        : highContrast
                                                        ? "bg-yellow-300 text-black hover:bg-yellow-400"
                                                        : "bg-[#EED9C4] text-[#3D2B1F] hover:bg-[#cda37f]"
                                                }`}
                                            >
                                                <button className="text-center">{tip}</button>
                                            </VoiceElement>
                                        );
                                    })}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <span
                                            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                                                highContrast ? "" : "text-gray-600"
                                            }`}
                                            style={{
                                                color: highContrast ? "var(--foreground)" : "#4B5563",
                                            }}
                                        >
                                            $
                                        </span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            className={`w-full py-2 pl-7 pr-3 border ${
                                                highContrast
                                                    ? "border-orange-400"
                                                    : "border-[#C2A385]"
                                            } rounded-lg focus:outline-none ${
                                                highContrast ? "" : "text-gray-600"
                                            } focus:ring-1 focus:ring-[#3D2B1F]`}
                                            value={customTip !== null ? customTip : ""}
                                            onChange={(e) => {
                                                const value = parseFloat(e.target.value);
                                                if (!isNaN(value) && value >= 0) {
                                                    setCustomTip(value);
                                                } else if (e.target.value === "") {
                                                    setCustomTip(null);
                                                }
                                            }}
                                            style={{
                                                borderColor: highContrast ? "var(--border)" : "#C2A385",
                                                color: highContrast ? "var(--foreground)" : "#4B5563",
                                            }}
                                        />
                                    </div>
                                    <VoiceElement
                                        id="apply-custom-tip"
                                        description="apply custom tip"
                                        onClick={() =>
                                            customTip !== null && handleTipSelect(customTip, true)
                                        }
                                    >
                                        <button
                                            className={`py-2 px-3 rounded-lg transition ${
                                                highContrast
                                                    ? customTip === null
                                                        ? "bg-yellow-300 text-black cursor-not-allowed"
                                                        : "bg-yellow-300 text-black hover:bg-yellow-400"
                                                    : customTip === null
                                                    ?  "bg-[#E5C7A8] text-[#3D2B1F] cursor-not-allowed"
                                                    : "bg-[#EED9C4] text-[#3D2B1F] hover:bg-[#cda37f]"
                                            }`}
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
                                    <span
                                        className={highContrast ? "" : "text-gray-600"}
                                        style={{
                                            color: highContrast ? "var(--foreground)" : "#4B5563",
                                        }}
                                    >
                                        Subtotal
                                    </span>
                                    <span
                                        className={`font-medium ${
                                            highContrast ? "" : "text-[#3D2B1F]"
                                        }`}
                                        style={{
                                            color: highContrast ? "var(--foreground)" : "#3D2B1F",
                                        }}
                                    >
                                        ${calculateTotal()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span
                                        className={highContrast ? "" : "text-gray-600"}
                                        style={{
                                            color: highContrast ? "var(--foreground)" : "#4B5563",
                                        }}
                                    >
                                        Tax
                                    </span>
                                    <span
                                        className={`font-medium ${
                                            highContrast ? "" : "text-[#3D2B1F]"
                                        }`}
                                        style={{
                                            color: highContrast ? "var(--foreground)" : "#3D2B1F",
                                        }}
                                    >
                                        ${(calculateTotal() * 0.08).toFixed(2)}
                                    </span>
                                </div>
                                {tipAmount > 0 && (
                                    <div className="flex justify-between">
                                        <span
                                            className={highContrast ? "" : "text-gray-600"}
                                            style={{
                                                color: highContrast ? "var(--foreground)" : "#4B5563",
                                            }}
                                        >
                                            Tip
                                        </span>
                                        <span
                                            className={`font-medium ${
                                                highContrast ? "" : "text-[#3D2B1F]"
                                            }`}
                                            style={{
                                                color: highContrast ? "var(--foreground)" : "#3D2B1F",
                                            }}
                                        >
                                            ${tipAmount.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 border-t border-gray-200">
                                    <span
                                        className={`text-lg font-bold ${
                                            highContrast ? "" : "text-[#3D2B1F]"
                                        }`}
                                        style={{
                                            color: highContrast ? "var(--foreground)" : "#3D2B1F",
                                        }}
                                    >
                                        Order Total
                                    </span>
                                    <span
                                        className={`text-lg font-bold ${
                                            highContrast ? "" : "text-[#3D2B1F]"
                                        }`}
                                        style={{
                                            color: highContrast ? "var(--foreground)" : "#3D2B1F",
                                        }}
                                    >
                                        ${(parseFloat(calculateTotal()) * 1.08 + tipAmount).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <VoiceElement
                                id="place-order"
                                description="place order"
                                disabled={cart.length === 0}
                                onClick={addOrder}
                            >
                                <button
                                    className={`w-full font-semibold px-6 py-3 rounded-lg shadow transition ${
                                        cart.length === 0
                                            ? highContrast
                                                ? "bg-orange-500 text-white cursor-not-allowed"
                                                : "bg-[#E5C7A8] text-[#3D2B1F] cursor-not-allowed"
                                            : highContrast
                                            ? "bg-orange-500 text-white hover:bg-orange-300"
                                            : "bg-[#3D2B1F] text-[#EED9C4] hover:bg-[#2a1d15]"
                                    }`}
                                    disabled={cart.length === 0}
                                >
                                    {cart.length === 0 ? "Your cart is empty" : "Place Order"}
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
                        <h3 className="text-2xl font-bold text-[#3D2B1F] mb-4">
                            Order Placed Successfully! 🎉
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Thank you, {custName()}! Your order has been placed
                            successfully.
                        </p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    router.push("/customer/menu");
                                }}
                                className="bg-[#3D2B1F] text-[#EED9C4] font-semibold px-4 py-2 rounded-lg hover:bg-[#2a1d15] transition"
                            >
                                Exit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </HighContrastWrapper>
    );
}
