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
                        className="text-red-500 hover:text-red-700 cursor-pointer"
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
            })
            .catch((err) => {
                console.error("Failed to fetch employees:", err);
            });
    }, [fetchData]);

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
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const [itemUpdateName, setItemName] = useState("");
    const [itemUpdatePrice, setItemPrice] = useState("");
    const [itemUpdateQuantity, setItemQuantity] = useState("");

    const updateInventory = async () => {
        if (
            !itemUpdateName ||
            (!itemUpdatePrice &&
            !itemUpdateQuantity)
        ) {
            alert("Missing fields");
            return;
        }

        const updateInfo = {};

        if (!itemUpdatePrice) {
            updateInfo.name = itemUpdateName;
            updateInfo.price = null;
            updateInfo.quantity = itemUpdateQuantity;
        }
        else if (!itemUpdateQuantity) {
            updateInfo.name = itemUpdateName;
            updateInfo.price = itemUpdatePrice;
            updateInfo.quantity = null;
        }
        else {
            updateInfo.name = itemUpdateName;
            updateInfo.price = itemUpdatePrice;
            updateInfo.quantity = itemUpdateQuantity;
        }

        try {
            const response = await fetch(`${SERVER}/updateInventory`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateInfo),
            });

            if (!response.ok) {
                throw new Error("Failed to update Item");
            }

            setItemName("");
            setItemPrice("");
            setItemQuantity("");
            refreshData();
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const [employeeIdRem, setEmpRemIdInput] = useState("");

    const fireEmployee = async () => {
        if (
            !employeeIdRem
        ) {
            alert("Missing fields");
            return;
        }

        try {
            if (employeeIdRem === "0") {
                throw new Error("Cannot Fire Admin");
            }

            const updateInfo = {};
            updateInfo.id = employeeIdRem;

            const response = await fetch(`${SERVER}/fireEmployee`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateInfo),
            });

            if (!response.ok) {
                throw new Error("Failed to remove Employee");
            }

            setEmpRemIdInput("");
            refreshData();
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const [employeeNameAdd, setEmpAddNameInput] = useState("");
    const [employeeShiftAdd, setEmpAddShiftI] = useState("");
    const [employeeRoleAdd, setEmpAddRoleI] = useState("");

    const addEmployee = async () => {
        if (
            !employeeNameAdd || !employeeShiftAdd || !employeeRoleAdd
        ) {
            alert("Missing fields");
            return;
        }

        const updateInfo = {};

        updateInfo.name = employeeNameAdd;
        updateInfo.shifttimings = employeeShiftAdd;
        updateInfo.role = employeeRoleAdd;
        
        try {
            const response = await fetch(`${SERVER}/addEmployee`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateInfo),
            });

            if (!response.ok) {
                throw new Error("Failed to update Employee");
            }

            setEmpAddNameInput("");
            setEmpAddRoleI("");
            setEmpAddShiftI("");
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
                <div className="bg-white rounded-md p-6 shadow-md flex flex-col md:flex-row gap-6 m-4 w-300 mx-auto">
                    <div className="flex-1 p-2 mb-2">
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
                            className="w-full p-3 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 cursor-pointer"
                        >
                            Add Drink
                        </button>
                    </div>
                    <div className="h-[425px] min-h-[1em] w-px self-stretch bg-gradient-to-tr from-transparent dark:via-neutral-400"></div>
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
                                className="w-full p-3 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 cursor-pointer"
                            >
                                Add Topping
                            </button>
                        </div>
                        <div className="h-[425px] min-h-[1em] w-px self-stretch bg-gradient-to-tr from-transparent dark:via-neutral-400"></div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold mb-2 text-black p-2">
                                Update Items
                            </h2>

                            {/* Input for Topping Name */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-black">
                                    Item Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={itemUpdateName}
                                    onChange={(e) => setItemName(e.target.value)}
                                    className="mt-1 p-2 w-full border rounded-md shadow-sm text-black"
                                    placeholder="Enter item name"
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
                                    value={itemUpdatePrice}
                                    onChange={(e) => setItemPrice(e.target.value)}
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
                                    id="quantity"
                                    value={itemUpdateQuantity}
                                    onChange={(e) => setItemQuantity(e.target.value)}
                                    className="mt-1 p-2 w-full border rounded-md shadow-sm text-black"
                                    placeholder="Enter quantity"
                                    step="0.01"
                                />
                            </div>

                            {/* Add Topping Button */}
                            <button
                                onClick={updateInventory}
                                className="w-full p-3 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 cursor-pointer"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                    <div className="bg-white rounded-md p-6 shadow-md flex flex-col gap-6 m-4 mt-8">
                        {/* Dropdown for Employee List */}
                        <div className="flex w-full">
                            <div className="flex-1 mx-4">
                                <h1 className="text-2xl font-bold mb-6 text-black text-center">
                                    Employee Management 
                                </h1>
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
                                <button onClick={editEmployee} className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 cursor-pointer">
                                    Save Changes
                                </button>
                            </div>
                            <div className="h-[330px] min-h-[1em] w-px self-stretch bg-gradient-to-tr from-transparent dark:via-neutral-400"></div>
                                <div className="flex-1 mx-4 ">
                                    <form>
                                    <h1 className="text-2xl font-bold mb-6 text-black text-center">
                                        Remove Employees 
                                    </h1>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-black">
                                                Employees
                                            </label>
                                            <select
                                                id="employee"
                                                value={employeeIdRem}
                                                onChange={(e) =>
                                                    setEmpRemIdInput(e.target.value)
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
                                    </form>
                                    <button onClick={fireEmployee} className="w-full bg-red-500 text-white p-2 rounded-md hover:bg-red-600 cursor-pointer">
                                        Fire Employee
                                    </button>
                                </div>
                                <div className="h-[330px] min-h-[1em] w-px self-stretch bg-gradient-to-tr from-transparent dark:via-neutral-400"></div>
                                    <div className="flex-1 mx-4 ">
                                        <h1 className="text-2xl font-bold mb-6 text-black text-center">
                                            Add Employees 
                                        </h1>
                                        <form>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-black">
                                                    Employee Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    value={employeeNameAdd}
                                                    onChange={(e) => setEmpAddNameInput(e.target.value)}
                                                    className="mt-1 p-2 w-full border rounded-md shadow-sm text-black"
                                                    placeholder="Enter employee name"
                                                />
                                            </div>

                                    {/* Dropdown for shifts */}   
                                    <div className="mb-4">
                                    <label className="block text-sm font-medium text-black">
                                            Shift
                                        </label>
                                        <select
                                            id="shift"
                                            value={employeeShiftAdd}
                                            onChange={(e) =>
                                                setEmpAddShiftI(e.target.value)
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
                                            value={employeeRoleAdd}
                                            onChange={(e) =>
                                                setEmpAddRoleI(e.target.value)
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
                                <button onClick={addEmployee} className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 cursor-pointer">
                                    Add Employee
                                </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
