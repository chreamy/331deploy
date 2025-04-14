"use client";
import { SERVER } from "@/app/const";
import { useState, useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";
import { FaTrash, FaCheck } from "react-icons/fa";
import annotationPlugin from 'chartjs-plugin-annotation';
Chart.register(annotationPlugin);

export function Management() {
    // State to trigger whenever information needs to be pulled
    const [fetchData, setfetchData] = useState(true);

    // Function to trigger information fetch for functions dependent on it
    const refreshData = () => {
        setfetchData(!fetchData);
    };
    
    // State to store data needed for stock
    const [stockNames, setName] = useState([]);
    const [stockQuantities, setQuantity] = useState([]);

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

    // UseEffect and jschart to make stock bar graphs
    useEffect(() => {
        if (!stockNames.length || !stockQuantities.length) return; // Ensure data is loaded before rendering

        const xValues = stockNames;
        const yValues = stockQuantities;

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const barColors = [
            "green",
            "blue",
            "orange",
            "yellow",
            "brown",
            "cyan",
            "purple",
            "teal",
            "gray"
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
                            size: 25, 
                            weight: "bold",
                        },
                        color: 'black',
                    },
                    annotation: {
                        annotations: {
                            line1: {
                                type: "line",
                                yMin: 15, 
                                yMax: 15,
                                borderColor: "red", 
                                borderWidth: 5, 
                                label: {
                                    content: 'Low Inventory', 
                                    enabled: true,
                                    display: true,
                                    position: "start", 
                                    font: {
                                        size: 20,
                                        weight: "bold",
                                    },
                                    yAdjust: -10,
                                    color: "black",
                                    backgroundColor: "transparent",
                                },
                            },
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                size: 16, 
                                weight: "bold",
                            },
                        },
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 14, 
                                weight: "bold",
                            },
                        },
                    },
                },
            },
        });
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [stockNames, stockQuantities, fetchData]);

    // Set state for items stored in the inventory 
    const [inventory, setInventory] = useState([]);

    // Fetch inventory information from the PostgreSQL server
    useEffect(() => {
        fetch(`${SERVER}/inventory`)
            .then((res) => res.json()) // put server response as a JSON
            .then((data) => {
                const fetchedData = data.inventory; // extract names of inventory items
                setInventory(fetchedData); // update inventory 
                //console.log(data.inventory);
            })
            .catch((err) => {
                console.error("Failed to fetch categories:", err);
            });
    }, [fetchData]);

    // Function that handles the list class used to display and modify the inventory
    const ProductList = ({ name, price, drinkid, toppingid }) => {
        return (
            <li className="flex justify-between items-center p-4 w-80 bg-gray-200 rounded-lg">
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

    // Function that handles deletion of an item from the database
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

    // State to store all drink categories that are available
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

    // Store the input values for a new drink 
    const [drinkNameInput, setDrinkNameI] = useState("");
    const [priceInput, setPriceI] = useState("");
    const [quantityInput, setQuantityI] = useState("");
    const [selectedCategoryInput, setSelectedCategoryI] = useState("");

    // Function that checks fields and handles adding new drinks to the inventory
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

    // Store the input values for a new topping
    const [toppingName, setToppingName] = useState("");
    const [toppingPrice, setToppingPrice] = useState("");
    const [toppingQuantity, setToppingQuantity] = useState("");

    function toSnakeCase(str) {
        return str.toLowerCase().replace(/ /g, "-");
    }   

    // Function that checks fields and handles adding new topping to the inventory
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

    // Store the information of all employees
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

    // Store the input values for a new employee
    const [employeeIdInput, setEmpIdInput] = useState("");
    const [employeeShiftInput, setEmpShiftI] = useState("");
    const [employeeRoleInput, setEmpRoleI] = useState("");

    // Function that checks fields and handles adding new employees to the database
    const editEmployee = async () => {
        if (employeeIdInput === "0") {
            setEmpIdInput("");
            setEmpRoleI("");
            setEmpShiftI("");
            throw new Error("Cannot Modify Admin");
        }
        
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

    // Store the input values for modifications to an existing item
    const [itemUpdateName, setItemName] = useState("");
    const [itemUpdatePrice, setItemPrice] = useState("");
    const [itemUpdateQuantity, setItemQuantity] = useState("");

    // Function that checks fields and handles updates to items in the inventory
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

    // Store the input values for the employee that will be removed 
    const [employeeIdRem, setEmpRemIdInput] = useState("");

    // Function that checks fields and removes employee information from database
    const fireEmployee = async () => {
        if (
            !employeeIdRem
        ) {
            alert("Missing fields");
            return;
        }

        try {
            if (employeeIdRem === "0") {
                setEmpRemIdInput("");
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

    // Store the input values for employee information to be added to the database 
    const [employeeNameAdd, setEmpAddNameInput] = useState("");
    const [employeeShiftAdd, setEmpAddShiftI] = useState("");
    const [employeeRoleAdd, setEmpAddRoleI] = useState("");

    // Function that checks fields and adds a new employee into the database
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
            <div className="flex-1 bg-gradient-to-b from-gray-900 to-gray-700 border-l-6 border-black pb-6">
                <h1 className="text-3xl text-left font-bold text-black p-4 text-center bg-neutral-400 sticky top-0 w-full">
                    Management Dashboard
                </h1>
                

                {/* Display the bar graph showing inventory stock */}
                <div className="flex items-center justify-center">
                    <canvas
                        className="bg-white rounded-2xl m-8 p-2 w-l h-l"
                        ref={chartRef}
                        style={{
                            width: "100%",
                            maxWidth: "1200px",
                            height: "700px",
                        }}
                    ></canvas>
                </div>

                {/* Display a list of all product names, prices, and deletion button */ }
                <div className="flex justify-center">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 ml-4 mb-4">
                    <h1 className="text-2xl font-bold mb-6 text-black text-center">
                        Product List
                    </h1>
                        <div className="grid grid-cols-2 gap-4">
                            {inventory.map((item) => (
                            <div
                                key={item.inventoryid}
                                className="flex flex-col md:flex-row items-center bg-gray-50 rounded-xl p-4 shadow-md"
                            >
                                <img
                                    src={`/drink-images/${toSnakeCase(item.name)}.png`}
                                    alt={item.name}
                                    className="w-40 h-40 object-contain mb-4 md:mb-0 md:mr-6"
                                />
                                <ProductList
                                    name={item.name}
                                    price={item.price}
                                    drinkid={item.drinkid}
                                    toppingid={item.toppingid}
                                    categoryname={item.categoryname}
                                />
                            </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row gap-6 m-4 w-300 mx-auto">
                    <div className="flex-1 p-2 mb-2">
                        <h2 className="text-2xl font-bold mb-6 text-black text-center">
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

                        {/* Input for Drink Price */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-black">
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

                        {/* Input for Drink Quantity */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-black">
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

                        {/* Dropdown for Drink Category Selection */}
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
                            <h2 className="text-2xl font-bold mb-6 text-black text-center">
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

                            {/* Input for Topping Price */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-black">
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

                            {/* Input for Topping Quantity */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-black">
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
                                <h2 className="text-2xl font-bold mb-6 text-black text-center">
                                    Update Inventory
                                </h2>

                                {/* Input for Item Name */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-black">
                                        Item Name
                                    </label>
                                    <select
                                        id="name"
                                        value={itemUpdateName}
                                        onChange={(e) =>
                                            setItemName(e.target.value)
                                        }
                                        className="mt-1 p-2 w-full border rounded-md shadow-sm text-black"
                                    >
                                        <option value="" disabled>
                                            Select an item
                                        </option>
                                        {inventory && inventory.length > 0 ? (
                                        inventory.map((index) => (
                                            <option key={index.inventoryid} value={index.name}>
                                                {index.name}
                                            </option>
                                            ))
                                        ): []}
                                    </select>
                                </div>

                                {/* Input for Price */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-black">
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
                                    <label className="block text-sm font-medium text-black">
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
                    
                        <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col gap-6 m-4 mt-8 my-0 w-300 mx-auto">
                            <div className="flex w-full">
                                {/* Dropdown for Employee List */}
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
                                {/* Dropdown for employee selection */} 
                                <div className="flex-1 mx-4 ">
                                    <form>
                                    <h1 className="text-2xl font-bold mb-6 text-black text-center">
                                        Remove Employee
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
                                    {/* Input for employee name */} 
                                    <div className="flex-1 mx-4">
                                        <h2 className="text-2xl font-bold mb-6 text-black text-center">
                                            Add Employee 
                                        </h2>
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
