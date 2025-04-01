"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
        <div>
            <Nav userRole="customer" />
            {/* Back Button */}
            <button onClick={() => router.back()}> Back</button>

            {/* Cart Header */}
            <h1>Cart</h1>

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