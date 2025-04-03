"use client";
import { SERVER } from "@/app/const";
import { useState, useEffect, useRef } from "react";
import Nav from "@/app/nav";
import { Chart } from 'chart.js/auto';

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
			    const stockName = data.stock.stock.map(item => item.name);
                const stockQuantity = data.stock.stock.map(item => item.quantity);
				
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

	const resizeElements = () => {
		setWindowWidth(window.innerWidth);
	};

		return (
    	<div className="flex w-screen">
        	<Nav userRole="manager"/>
        	<div className={`flex-1 bg-gradient-to-b from-gray-900 to-gray-700 border-l-6 border-black`}>
				<h1 className="text-3xl text-left font-bold text-black p-4 text-center bg-neutral-400">
                	Sales Trend
            	</h1>

				{/* Display loading message and the list of categories */}
				<div className="flex flex-col items-center justify-center">
					<canvas className="bg-white rounded-xl m-8 p-2" ref={chartRef} style={{ width: "100%", maxWidth: "w-screen" }}></canvas>
				</div>
  			</div>
    	</div>
  	);
}
