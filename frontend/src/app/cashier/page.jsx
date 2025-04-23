"use client";
import { SERVER } from "@/app/const";
import { useEffect, useState } from "react";
import Nav from "@/app/nav";

export default function CashierView() {
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState({});
    const [selectedCategory, setSelectedCategory] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [order, setOrder] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [options, setOptions] = useState({ toppings: [], modifications: [] });
    const [selectedOptions, setSelectedOptions] = useState({ toppings: [], modifications: {} });

    useEffect(() => {
        fetch(`${SERVER}/categories`)
            .then((res) => res.json())
            .then((data) => {
                setCategories(Object.keys(data));
                setItems(data);
                setSelectedCategory(Object.keys(data)[0]);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch categories:", err);
                setLoading(false);
            });
    }, []);

    const filteredItems = (items[selectedCategory] || []).filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchOptions = async (drink_id) => {
        try {
            const res = await fetch(`${SERVER}/drink-options/${drink_id}`);
            const data = await res.json();
            setOptions(data);

            // Initialize default selections
            const defaultMods = {};
            data.modifications.forEach(mod => {
                defaultMods[mod.type] = mod.options[0];
            });
            setSelectedOptions({ toppings: [], modifications: defaultMods });
        } catch (err) {
            console.error("Error fetching options:", err);
        }
    };

    const addOrder = async () => {    
        try {
            const response = await fetch(`${SERVER}/newOrderCashier`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(order),
            });
        
            if (!response.ok) {
                throw new Error("Failed to add order");
            }
            setOrder([]);

        } catch (error) {
            console.error("Failed to add order", error);
        }
    };

    const openModal = (item) => {
        setSelectedItem(item);
        fetchOptions(item.id);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedItem(null);
        setOptions({ toppings: [], modifications: [] });
        setSelectedOptions({ toppings: [], modifications: {} });
        setShowModal(false);
    };

    const toggleTopping = (topping) => {
        setSelectedOptions((prev) => {
            const exists = prev.toppings.includes(topping);
            const toppings = exists
                ? prev.toppings.filter(t => t !== topping)
                : [...prev.toppings, topping];
            return { ...prev, toppings };
        });
    };

    const updateModification = (type, value) => {
        setSelectedOptions((prev) => ({
            ...prev,
            modifications: {
                ...prev.modifications,
                [type]: value,
            },
        }));
    };

    const addToOrder = () => {
        const selectedToppingObjs = options.toppings.filter(t =>
            selectedOptions.toppings.includes(t.name)
        );
    
        const orderItem = {
            ...selectedItem,
            modifications: selectedOptions.modifications,
            toppings: selectedToppingObjs, // Save name + price
        };
    
        setOrder((prev) => [...prev, orderItem]);
        closeModal();
    };

    const removeFromOrder = (index) => {
        setOrder((prev) => prev.filter((_, i) => i !== index));
    };

    const subtotal = order.reduce((sum, item) => {
        const toppingTotal = item.toppings?.reduce((acc, t) => acc + Number(t.price || 0), 0) || 0;
        return sum + item.price + toppingTotal;
    }, 0);
        
    const tax = subtotal * 0.0825;
    const total = subtotal + tax;

    return (
        <div className="min-h-screen bg-[#3D2B1F] text-[var(--foreground)] p-4 md:p-8 font-sans">
            <Nav userRole="cashier" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 mt-6">
                <a href="/manager">
                    <button className="bg-[#C2A385] text-white font-semibold px-6 py-2 rounded-xl shadow hover:scale-105 hover:shadow-lg transition-transform ml-4">
                        Manager View
                    </button>
                </a>

                <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <label htmlFor="search" className="font-semibold">Search Drink:</label>
                    <input
                        id="search"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="e.g. Honey Milk Tea"
                        className="rounded-md px-4 py-2 w-64 text-black placeholder-gray-500 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#EED9C4]"
                    />
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <div className="w-full lg:w-1/6 bg-zinc-800 p-4 rounded-xl shadow-md">
                    <h2 className="text-lg font-bold mb-4 text-[#EED9C4]">Categories</h2>
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`w-full mb-3 py-2 px-4 rounded-xl text-left font-medium ${selectedCategory === cat ? "bg-[#C2A385] text-white" : "bg-zinc-700 hover:bg-[#EED9C4] hover:text-black"}`}
                            >
                                {cat}
                            </button>
                        ))
                    )}
                </div>

                {/* Items and Summary */}
                <div className="flex-1 flex flex-col lg:flex-row gap-6">
                    {/* Item Grid */}
                    <div className="w-full lg:w-2/3 bg-zinc-100 rounded-xl p-4 text-black shadow-xl">
                        <h2 className="text-2xl font-bold mb-4">Select Items</h2>
                        <div className="space-y-4">
                            {filteredItems.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => openModal(item)}
                                    className="w-full text-left p-6 bg-gradient-to-b from-gray-100 to-[#EED9C4] rounded-xl shadow hover:scale-105 transition-transform font-semibold"
                                >
                                    {item.name} - ${item.price.toFixed(2)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Summary Panel */} 
                    <div className="w-full lg:w-1/3 bg-zinc-100 rounded-xl p-6 text-black shadow-xl flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-bold mb-4">Summary</h2>
                            <div className="h-64 overflow-y-auto border p-3 rounded-lg bg-gray-50 space-y-2">
                                {order.map((item, idx) => {
                                    const itemToppings = item.toppings || [];
                                    const toppingCost = itemToppings.reduce((sum, t) => sum + (t.price || 0), 0);


                                    return (
                                        <div key={idx} className="text-sm bg-white p-2 rounded-lg shadow flex justify-between">
                                            <div>
                                                <div className="font-semibold">{item.name} - ${item.price.toFixed(2)}</div>
                                                {itemToppings.length > 0 && (
                                                    <div className="text-xs ml-2">
                                                        + Toppings: {itemToppings.map((t, i) => (
                                                            <span key={i}>
                                                                {t.name} (${parseFloat(t.price).toFixed(2)})
                                                                {i < itemToppings.length - 1 && ", "}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                {item.modifications && Object.keys(item.modifications).length > 0 && (
                                                    <div className="text-xs ml-2">
                                                        + Mods: {Object.entries(item.modifications).map(([k, v]) => `${k}: ${v}`).join(", ")}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => removeFromOrder(idx)}
                                                className="ml-2 text-red-600 hover:text-red-800 font-bold"
                                            >
                                                X
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="mt-4 text-sm">
                            <p>Subtotal: ${subtotal.toFixed(2)}</p>
                            <p>Tax: ${(subtotal * 0.0825).toFixed(2)}</p>
                            <p className="font-semibold">Total: ${(subtotal + subtotal * 0.0825).toFixed(2)}</p>
                            <button 
                                onClick={() => {
                                    if (order.length > 0) {
                                       addOrder()
                                    }
                                }}
                                className="mt-4 w-full bg-[#C2A385] text-white px-4 py-2 rounded-xl font-bold hover:scale-105 transition-transform"
                            >
                                Card Checkout
                            </button>
                            
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white text-black p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Customize {selectedItem.name}</h2>

                        {/* Modifications */}
                        {options.modifications.map((mod) => (
                            <div key={mod.type} className="mb-4">
                                <label className="block font-semibold mb-1">{mod.type}</label>
                                <select
                                value={selectedOptions.modifications[mod.type] || ""}
                                onChange={(e) => updateModification(mod.type, e.target.value)}
                                className="w-full border p-2 rounded-md"
                                >
                                {mod.options.map((opt, i) => (
                                    <option key={i} value={opt}>{opt}</option>
                                ))}
                                </select>
                            </div>
                        ))}

                        {/* Toppings */}
                        <div className="mb-4">
                            <label className="block font-semibold mb-2">Toppings</label>
                            {options.toppings.map((top) => (
                                <div key={top.name} className="flex items-center mb-1">
                                    <input
                                        type="checkbox"
                                        checked={selectedOptions.toppings.includes(top.name)}
                                        onChange={() => toggleTopping(top.name)}
                                        className="mr-2"
                                    />
                                    <span>{top.name} (+${top.price.toFixed(2)})</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 border rounded-md hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addToOrder}
                                className="px-4 py-2 bg-[#C2A385] text-white rounded-md hover:bg-[#b79877]"
                            >
                                Add to Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
