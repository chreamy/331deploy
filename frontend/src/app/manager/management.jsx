"use client";
import { SERVER } from "@/app/const";
import { useState, useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";
import { FaTrash } from "react-icons/fa";

export function Management() {
    // State to store data that will be needed
    const [stockNames, setName] = useState([]);
    const [stockQuantities, setQuantity] = useState([]);
    const [fetchData, setfetchData] = useState(true);

    const refreshData = () => {
        setfetchData(!fetchData);
    };

    // Fetch stock information from the PostgreSQL server
    useEffect(() => {
        fetch(`${SERVER}/stock`)
            .then((res) => res.json())
            .then((data) => {
                const stockName = data.stock.map((item) => item.name);
                const stockQuantity = data.stock.map((item) => item.quantity);

                setName(stockName);
                setQuantity(stockQuantity);
            })
            .catch((err) => {
                console.error("Error fetching stock data:", err);
            });
    }, [fetchData]);

    const chartRef = useRef(null);
    var chartInstance = useRef(null);

    useEffect(() => {
        if (!stockNames.length || !stockQuantities.length) return; // Ensure data is loaded before rendering

        const xValues = stockNames;
        const yValues = stockQuantities;

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const barColors = [
            "red",
            "green",
            "blue",
            "orange",
            "yellow",
            "brown",
            "cyan",
            "teal",
        ];

        chartInstance.current = new Chart(chartRef.current, {
            type: "bar",
            data: {
                labels: xValues,
                datasets: [
                    {
                        backgroundColor: barColors,
                        data: yValues,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: "Current Stock",
                        font: {
                            size: 20, // Adjust font size
                            weight: "bold", // Make the title bold
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                size: 16, // Adjust font size
                                weight: "bold",
                            },
                        },
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 14, // Adjust font size
                                weight: "bold",
                            },
                        },
                    },
                },
            },
        });
    }, [stockNames, stockQuantities, fetchData]);

    useEffect(() => {
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, []);

    const [inventory, setInventory] = useState([]);

    // Fetch inventory information from the PostgreSQL server
    useEffect(() => {
        fetch(`${SERVER}/inventory`)
            .then((res) => res.json()) // put server response as s JSON
            .then((data) => {
                const fetchedData = data.inventory; // extract category names
                setInventory(fetchedData); // update categories
            })
            .catch((err) => {
                console.error("Failed to fetch categories:", err);
            });
    }, [fetchData]);

    const ProductList = ({ name, price, drinkid, toppingid }) => {
        return (
            <li className="flex justify-between items-center p-4 bg-gray-200 rounded-lg">
                <span className="text-lg font-semibold text-gray-800">
                    {name}
                </span>
                <div className="flex gap-2">
                    <span className="text-lg font-bold text-green-600 text-right">
                        ${price.toFixed(2)}
                    </span>
                    <button
                        onClick={() => deleteItem(name, drinkid, toppingid)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <FaTrash />
                    </button>
                </div>
            </li>
        );
    };

    const deleteItem = async (name, drinkid, toppingid) => {
        if (toppingid === null) { 
            try {
                const drinkInformation = {
                    name,
                    drinkid,
                };
                const response = await fetch(`${SERVER}/removeDrink`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(drinkInformation),
                });
                if (!response.ok) {
                    throw new Error("Failed to add drink");
                }
                refreshData();
            } catch (error) {}
        }
        else if (drinkid === null) {
            try {
                const toppingInformation = {
                    name,
                    toppingid,
                };
                const response = await fetch(`${SERVER}/removeTopping`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(toppingInformation),
                });
                console.log("Refreshing data after delete");
                if (!response.ok) {
                    throw new Error("Failed to delete product");
                }
                
                refreshData();
            } catch (error) {}
        }

    };

    const [categories, setCategories] = useState([]);

    // Fetch categories from the PostgreSQL server
    useEffect(() => {
        fetch(`${SERVER}/uniquecategories`)
            .then((res) => res.json())
            .then((data) => {
                setCategories(data.categories);
            })
            .catch((err) => {
                console.error("Failed to fetch categories:", err);
            });
    }, []);

    const [drinkNameInput, setDrinkNameI] = useState("");
    const [priceInput, setPriceI] = useState("");
    const [quantityInput, setQuantityI] = useState("");
    const [selectedCategoryInput, setSelectedCategoryI] = useState("");

    const addDrink = async () => {
        if (
            !drinkNameInput ||
            !priceInput ||
            !quantityInput ||
            !selectedCategoryInput
        ) {
            alert("Missing fields");
            return;
        }

        const drinkToInventory = {
            drinkNameInput,
            quantityInput,
            priceInput,
            selectedCategoryInput,
        };

        try {
            const response = await fetch(`${SERVER}/addInventory`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(drinkToInventory),
            });

            if (!response.ok) {
                throw new Error("Failed to add drink");
            }

            setDrinkNameI("");
            setPriceI("");
            setQuantityI("");
            setSelectedCategoryI("");
            refreshData();
        } catch (error) {
            console.error("Error in adding drink:", error);
        }
    };

    const [toppingName, setToppingName] = useState("");
    const [toppingPrice, setToppingPrice] = useState("");
    const [toppingQuantity, setToppingQuantity] = useState("");

    const addTopping = async () => {
        if (
            !toppingName ||
            !toppingPrice ||
            !toppingQuantity
        ) {
            alert("Missing fields");
            return;
        }

        const toppingToInv = {
            toppingName,
            toppingPrice,
            toppingQuantity,
        };

        try {
            const response = await fetch(`${SERVER}/addTopping`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(toppingToInv),
            });

            if (!response.ok) {
                throw new Error("Failed to add topping");
            }

            setToppingName("");
            setToppingPrice("");
            setToppingQuantity("");
            refreshData();
        } catch (error) {
            console.error("Error in adding drink:", error);
        }
    };

    const [employeeId, setEmpId] = useState([]);
    const [employeeShift, setEmpShift] = useState("");
    const [employeeRole, setEmpRole] = useState("");

    // Fetch inventory information from the PostgreSQL server
    useEffect(() => {
        fetch(`${SERVER}/employees`)
            .then((res) => res.json()) // put server response as a JSON
            .then((data) => {
                const empData = data.employees.map((item) => ({
                    id: item.id,
                    name: item.name,
                }));
                setEmpId(empData);
                const empRole = data.employees.map((item) => item.role);
                setEmpShift(empRole);
                const empShift = data.employees.map((item) => item.shifttimings);
                setEmpRole(empShift);
            })
            .catch((err) => {
                console.error("Failed to fetch employees:", err);
            });
    }, []);

    const [employeeIdInput, setEmpIdInput] = useState("");
    const [employeeShiftInput, setEmpShiftI] = useState("");
    const [employeeRoleInput, setEmpRoleI] = useState("");

    const editEmployee = async () => {
        if (
            !employeeIdInput ||
            (!employeeShiftInput &&
            !employeeRoleInput)
        ) {
            alert("Missing fields");
            return;
        }

        const updateInfo = {};

        if (!employeeShiftInput) {
            updateInfo.id = employeeIdInput;
            updateInfo.shifttimings = null;
            updateInfo.role = employeeRoleInput;
        }
        else if (!employeeRoleInput) {
            updateInfo.id = employeeIdInput;
            updateInfo.shifttimings = employeeShiftInput;
            updateInfo.role = null;
        }
        else {
            updateInfo.id = employeeIdInput;
            updateInfo.shifttimings = employeeShiftInput;
            updateInfo.role = employeeRoleInput;
        }

        try {
            const response = await fetch(`${SERVER}/updateEmployee`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateInfo),
            });

            if (!response.ok) {
                throw new Error("Failed to update Employee");
            }

            setEmpIdInput("");
            setEmpRoleI("");
            setEmpShiftI("");
            refreshData();
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div className="overflow-auto h-screen">
            <div className="flex-1 bg-gradient-to-b from-gray-900 to-gray-700 border-l-6 border-black flex-col">
                <h1 className="text-3xl text-left font-bold text-black p-4 text-center bg-neutral-400">
                    Management
                </h1>

                {/* Display the ist of categories */}
                <div className="flex items-center justify-center">
                    <canvas
                        className="bg-white rounded-xl m-8 p-2 w-l h-l"
                        ref={chartRef}
                        style={{
                            width: "100%",
                            maxWidth: "1200px",
                            height: "700px",
                        }}
                    ></canvas>
                </div>
                <div className="flex items-center justify-center">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 ml-4 mb-4">
                        <h1 className="text-2xl font-bold mb-6 text-black text-center">
                            Product List
                        </h1>
                        <div className="grid grid-cols-3 gap-5 size-275 h-auto">
                            {inventory.map((index) => (
                                <ProductList
                                    key={index.inventoryid}
                                    foreignKey={index.categoryid}
                                    name={index.name}
                                    price={index.price}
                                    drinkid={index.drinkid}
                                    toppingid={index.toppingid}
                                    categoryname={index.categoryname}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-md p-6 shadow-md flex flex-col md:flex-row gap-6 m-4">
                    <div className="flex-1 border-r border-gray-300 p-2 pr-8">
                        <h2 className="text-xl font-bold mb-4 text-black">
                            Add New Drink
                        </h2>

                        {/* Input for Drink Name */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-black">
                                Drink Name
                            </label>
                            <input
                                type="text"
                                id="drinkName"
                                value={drinkNameInput}
                                onChange={(e) => setDrinkNameI(e.target.value)}
                                className="mt-1 p-2 w-full border rounded-md shadow-sm text-black"
                                placeholder="Enter drink name"
                            />
                        </div>

                        {/* Input for Price */}
                        <div className="mb-4">
                            <label
                                htmlFor="price"
                                className="block text-sm font-medium text-black"
                            >
                                Price
                            </label>
                            <input
                                type="number"
                                id="price"
                                value={priceInput}
                                onChange={(e) => setPriceI(e.target.value)}
                                className="mt-1 p-2 w-full border rounded-md shadow-sm text-black"
                                placeholder="Enter price"
                                step="0.01"
                            />
                        </div>

                        {/* Input for Quantity */}
                        <div className="mb-4">
                            <label
                                htmlFor="price"
                                className="block text-sm font-medium text-black"
                            >
                                Quantity
                            </label>
                            <input
                                type="number"
                                id="price"
                                value={quantityInput}
                                onChange={(e) => setQuantityI(e.target.value)}
                                className="mt-1 p-2 w-full border rounded-md shadow-sm text-black"
                                placeholder="Enter quantity"
                                step="0.01"
                            />
                        </div>

                        {/* Dropdown for Category Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-black">
                                Category
                            </label>
                            <select
                                id="category"
                                value={selectedCategoryInput}
                                onChange={(e) =>
                                    setSelectedCategoryI(e.target.value)
                                }
                                className="mt-1 p-2 w-full border rounded-md shadow-sm text-black"
                            >
                                <option value="" disabled>
                                    Select a category
                                </option>
                                {categories && categories.categories && categories.categories.length > 0 ? (
                                    categories.categories.map((category) => (
                                
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                                ))
                            ): []}
                            </select>
                        </div>
                        
                        {/* Add Drink Button */}
                        <button
                            onClick={addDrink}
                            className="w-full p-3 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600"
                        >
                            Add Drink
                        </button>
                    </div>
                    
                    <div className="flex-1">
                        <h2 className="text-xl font-bold mb-2 text-black p-2">
                            Add New Topping
                        </h2>

                        {/* Input for Topping Name */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-black">
                                Topping Name
                            </label>
                            <input
                                type="text"
                                id="toppingName"
                                value={toppingName}
                                onChange={(e) => setToppingName(e.target.value)}
                                className="mt-1 p-2 w-full border rounded-md shadow-sm text-black"
                                placeholder="Enter topping name"
                            />
                        </div>

                        {/* Input for Price */}
                        <div className="mb-4">
                            <label
                                htmlFor="price"
                                className="block text-sm font-medium text-black"
                            >
                                Price
                            </label>
                            <input
                                type="number"
                                id="price"
                                value={toppingPrice}
                                onChange={(e) => setToppingPrice(e.target.value)}
                                className="mt-1 p-2 w-full border rounded-md shadow-sm text-black"
                                placeholder="Enter price"
                                step="0.01"
                            />
                        </div>

                        {/* Input for Quantity */}
                        <div className="mb-4">
                            <label
                                htmlFor="price"
                                className="block text-sm font-medium text-black"
                            >
                                Quantity
                            </label>
                            <input
                                type="number"
                                id="price"
                                value={toppingQuantity}
                                onChange={(e) => setToppingQuantity(e.target.value)}
                                className="mt-1 p-2 w-full border rounded-md shadow-sm text-black"
                                placeholder="Enter quantity"
                                step="0.01"
                            />
                        </div>

                        {/* Add Topping Button */}
                        <button
                            onClick={addTopping}
                            className="w-full p-3 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600"
                        >
                            Add Topping
                        </button>
                    </div>
                    
                </div>
                <div className="bg-white rounded-md p-6 shadow-md flex flex-col gap-6 m-4 mt-8">
                    <h1 className="text-2xl font-bold mb-6 text-black text-center">
                        Employee Management 
                    </h1>
                    {/* Dropdown for Employee List */}
                    <form>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-black">
                                Employees
                            </label>
                            <select
                                id="employee"
                                value={employeeIdInput}
                                onChange={(e) =>
                                    setEmpIdInput(e.target.value)
                                }
                                className="mt-1 p-2 w-full border rounded-md shadow-sm text-black"
                            >
                                <option value="" disabled>
                                    Select an employee
                                </option>
                                {employeeId && employeeId.length > 0 ? (
                                    employeeId.map((employee) => (
                                
                                <option key={employee.id} value={employee.id}>
                                    {employee.name}
                                </option>
                                ))
                            ): []}
                            </select>
                        </div>

                        {/* Dropdown for shifts */}   
                        <div className="mb-4">
                        <label className="block text-sm font-medium text-black">
                                Shift
                            </label>
                            <select
                                id="shift"
                                value={employeeShiftInput}
                                onChange={(e) =>
                                    setEmpShiftI(e.target.value)
                                }
                                className="mt-1 p-2 w-full border rounded-md shadow-sm text-black"
                            >
                                <option value="" disabled>Select a Shift Timing</option>
                                <option value="Morning">Morning</option>
                                <option value="Afternoon">Afternoon</option>
                                <option value="Evening">Evening</option>
                            </select>
                        </div>

                        {/* Dropdown for roles */}   
                        <div className="mb-4">
                        <label className="block text-sm font-medium text-black">
                                Roles
                            </label>
                            <select
                                id="role"
                                value={employeeRoleInput}
                                onChange={(e) =>
                                    setEmpRoleI(e.target.value)
                                }
                                className="mt-1 p-2 w-full border rounded-md shadow-sm text-black"
                            >
                                <option value="" disabled>Select a Role</option>
                                <option value="Cashier">Cashier</option>
                                <option value="Manager">Manager</option>
                                <option value="Janitor">Janitor</option>
                                <option value="Barista">Barista</option>
                            </select>
                        </div>
                    </form>
                    <button onClick={editEmployee} className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
