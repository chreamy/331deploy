"use client";
import { SERVER } from "@/app/const";
import { useState, useEffect, useRef } from "react";
import Nav from "@/app/nav";
import { Chart } from 'chart.js/auto';
import { FaTrash } from "react-icons/fa";

	export default function ManagerTrend() {

	// State to store data that will be needed
	const [loading, setLoading] = useState(true);
	const [stockNames, setName] = useState([]);
	const [stockQuantities, setQuantity]= useState([]);

	// Fetch stock information from the PostgreSQL server
	useEffect(() => {
        fetch(`${SERVER}/stock`)
            .then((res) => res.json())
            .then((data) => {
			    const stockName = data.stock.map(item => item.name);
                const stockQuantity = data.stock.map(item => item.quantity);
				
                setName(stockName);
                setQuantity(stockQuantity);
            })
            .catch((err) => {
                console.error("Error fetching stock data:", err);
                setLoading(false);
            });
    }, []); 

	const chartRef = useRef(null);
	var chartInstance = useRef(null);

	useEffect(() => {
		if (!stockNames.length || !stockQuantities.length) return; // Ensure data is loaded before rendering

		const xValues = stockNames;
		const yValues = stockQuantities;
		
		if (chartInstance.current) {
			chartInstance.current.destroy();
		  }

		const barColors = ["red", "green","blue","orange","yellow","brown","cyan","teal"];
			
		chartInstance = new Chart(chartRef.current, {
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
	}, [stockNames, stockQuantities]);

	const [inventory, setInventory] = useState([]);

	// Fetch inventory information from the PostgreSQL server
    useEffect(() => {
        fetch(`${SERVER}/inventory`) 
            .then((res) => res.json()) // put server response as s JSON
            .then((data) => {
                const fetchedData = data.inventory; // extract category names
                setInventory(fetchedData); // update categories
                setLoading(false);
				//console.log(fetchedData);
            })
            .catch((err) => {
                console.error("Failed to fetch categories:", err);
                setLoading(false);
            });
    }, []);

	const ProductList = ({ name, price }) => {
		return (
		  <li className="flex justify-between items-center p-4 bg-gray-200 rounded-lg">
			<span className="text-lg font-semibold text-gray-800">{name}</span>
			<div className="flex gap-2">
			<span className="text-lg font-bold text-green-600 text-right">${price.toFixed(2)}</span>
				<button onClick={() => deleteItem(pr)} 
					className="text-red-500 hover:text-red-700"
					>
					<FaTrash />
				</button>
			</div>
		  </li>
		);
	  };

	  const deleteItem = async (drinkid, inventoryid) => {
		try {
		  const response = await fetch(`/inventory/${drinkid}`, {
			method: "DELETE",
		  });
	
		  if (!response.ok) {
			throw new Error("Failed to delete product");
		  }
	
		  setProducts(products.filter((product) => product.drinkid !== drinkid));
		} catch (error) {
		  setError(error.message);
		}
	  };

	  const [categories, setCategories] = useState([]);

	  // Fetch categories from the PostgreSQL server
	  useEffect(() => {
		fetch(`${SERVER}/uniquecategories`) 
			.then((res) => res.json())
			.then((data) => {
				setCategories(data.categories);
				setLoading(false);

			})
			.catch((err) => {
				console.error("Failed to fetch categories:", err);
				setLoading(false);
			});
	}, []);

	const [drinkNameInput, setDrinkNameI] = useState('')
	const [priceInput, setPriceI] = useState('');
	const [quantityInput, setQuantityI] = useState('');
	const [selectedCategoryInput, setSelectedCategoryI] = useState('');

	async function addDrink() {
		if (!drinkNameInput || !priceInput || !quantityInput || !selectedCategoryInput) {
			return;
	  	}
		// all fields are filled out
		const drinkToInventory = {drinkNameInput, priceInput, quantityInput, selectedCategoryInput};
		
		const response = await fetch(`${SERVER}/inventory`, {
			method: 'POST',
			body: JSON.stringify(newDrink),
		  });
	}

		return (
    	<div className="flex">
        	<Nav userRole="manager"/>
        	<div className={`flex-1 bg-gradient-to-b from-gray-900 to-gray-700 border-l-6 border-black`}>
				<h1 className="text-3xl text-left font-bold text-black p-4 text-center bg-neutral-400">
                	Management
            	</h1>

				{/* Display the ist of categories */}
				<div className="flex items-center justify-center">
					<canvas className="bg-white rounded-xl m-8 p-2 w-l h-l" ref={chartRef} style={{ width: '100%', maxWidth: '1150px', height: '700px' }} ></canvas>
				</div>
				<div className="flex items-center justify-center">
					<div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 ml-4 mb-4">
						<h1 className="text-2xl font-bold mb-6 text-black text-center">Product List</h1>
							<div className="grid grid-cols-4 gap-2">
								{inventory.map((index) => ( <ProductList
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
				<div className="max-w-lg mx-auto p-4 border rounded-lg shadow-lg bg-white">
					<h2 className="text-xl font-bold mb-4 text-black">Add New Drink</h2>
					
					{/* Input for Drink Name */}
					<div className="mb-4">
						<label className="block text-sm font-medium text-black">Drink Name</label>
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
						<label htmlFor="price" className="block text-sm font-medium text-black">Price</label>
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
						<label htmlFor="price" className="block text-sm font-medium text-black">Quantity</label>
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
						<label className="block text-sm font-medium text-black">Category</label>
						<select
							id="category"
							value={selectedCategoryInput}
							onChange={(e) => setSelectedCategoryI(e.target.value)}
							className="mt-1 p-2 w-full border rounded-md shadow-sm text-black"
						>
							<option value="" disabled> Select a category </option>
							{categories.length === 0 ? (
							<option disabled>No categories found</option>
							) : (
							categories.categories.map((category) => (
								<option key={category.id} value={category.id}>
								{category.name}
								</option>
							))
							)}
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
  			</div>
    	</div>
  	);
}
