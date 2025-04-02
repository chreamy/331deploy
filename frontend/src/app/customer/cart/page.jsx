"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import Nav from "@/app/nav";

export default function OrderCart() {
    const router = useRouter();

    // Setting cart state (currently placeholder values)
    const [cart, setCart] = useState([
        {
            id: 1,
            name: "Milk Tea",
            photo: "/drink-images/classic-milk-tea.png", 
            price: 2000, 
            quantity: 1,
            modifications: [
                { name: "Extra Tapioca", price: 200 },
                { name: "Less Sugar", price: 0 },
            ],
        },
    ]);

    // Function that calculates the total price of items in the cart
    const calculateTotal = () => {
        var total = 0;
        cart.forEach((item) => {
            var itemTotal = item.price;
            item.modifications.forEach((mod) => {
                itemTotal += mod.price;
            });
            total += itemTotal * item.quantity;
        });
        return (total / 100).toFixed(2); 
    };

    // Functionality for the delete button
    const deleteItem = (id) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-700 font-[Roboto]">
            <Nav userRole="customer" />
            {/* Back Button */}
                <div className="mt-6 p-4">
                    <IoArrowBackCircleOutline
                        className="text-3xl cursor-pointer text-[#EED9C4]"
                        onClick={() => router.back()}
                    />
                </div>

            {/* Cart Header */}
            <h2 className="text-3xl font-extrabold mt-0 mb-6 text-center text-[#EED9C4] drop-shadow-md">
                {"Your Cart"}
            </h2>

            {/* Items Section */}
            {cart.map((item) => (
                <div key={item.id}>
                    <img src={item.photo} alt={item.name} width="100" />
                    <h2>{item.name}</h2>
                    <ul>
                        {item.modifications.map((mod, index) => (
                            <li key={index}>
                                {mod.name}: +${(mod.price / 100).toFixed(2)}
                            </li>
                        ))}
                    </ul>
                    <p>Quantity: {item.quantity}</p>
                    <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                    <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                    <button onClick={() => deleteItem(item.id)}>Delete</button>
                </div>
            ))}

            {/* Total Price */}
            <h2>Total Price: ${calculateTotal()}</h2>

            {/* Action Buttons */}
            <button onClick={() => router.push("/customer/menu")}>Add More Items</button>
      </div>
    );
}