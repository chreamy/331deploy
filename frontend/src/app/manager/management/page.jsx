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

		return (
    	<div className="flex">
        	<Nav userRole="manager"/>
        	<div className={`flex-1 bg-gradient-to-b from-gray-900 to-gray-700 border-l-6 border-black`}>
				<h1 className="text-3xl text-left font-bold text-black p-4 text-center bg-neutral-400">
                	Management
            	</h1>

				{/* Display loading message and the list of categories */}
				<div className="flex items-center justify-center">
					<canvas className="bg-white rounded-xl m-8 p-2 w-l h-l" ref={chartRef} style={{ width: '100%', maxWidth: '1150px', height: '700px' }} ></canvas>
				</div>
				<div className="flex items-center justify-center">
					<div className="bg-white w-1/2 border border-gray-200 rounded-lg shadow-lg p-2 ml-4 mb-4">
						<h1 className="text-2xl font-bold mb-6 text-black text-center">Product List</h1>
							<div className="grid grid-cols-2 gap-2">
								{inventory.map((index) => ( <ProductList
									key={index.inventoryid}
									foreignKey={index.inventoryid} 
									name={index.name} 
									price={index.price} 
									drinkid={index.drinkid}
									toppingid={index.toppingid}
								/>
							))}
						</div>
					</div>
					<div>
							<h1 className="bg-white w-1/2 border border-gray-200 rounded-lg shadow-lg p-2 ml-4 mb-4"></h1>
						</div>
				</div>
  			</div>
    	</div>
  	);
}
