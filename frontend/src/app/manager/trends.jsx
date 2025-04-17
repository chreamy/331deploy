"use client";
import { SERVER } from "@/app/const";
import { useState, useRef, useEffect } from "react";
import Nav from "@/app/nav";
import { Chart } from "chart.js/auto";

export default function Trends() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loadingPieChart, setLoadingPieChart] = useState(false);
    const [stockNames, setName] = useState([]);
    const [stockPopCount, setPopCount] = useState([]);
    const [loadingPieChartMonth, setLoadingPieChartMonth] = useState(false);
    const [stockNamesMonth, setNameMonth] = useState([]);
    const [stockPopCountMonth, setPopCountMonth] = useState([]);
    const [timeframeInput, setTimeFrame] = useState("");
    const popularityChartRef = useRef(null);
        
    const scrollToChartRef = () => {
        popularityChartRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchDailyData = async () => {
        setLoadingPieChart(true);
        try {
            const response = await fetch(`${SERVER}/daily-product-popularity/${date}`);
            const data = await response.json();
            const nameArray = data.map(item => item.name);
            const countArray = data.map(item => item.count);

            setName(nameArray);
            setPopCount(countArray);
        } catch (error) {
            console.error("Error fetching hourly data:", error);
        }
        setLoadingPieChart(false);
    };

    const popularityPieRef = useRef(null);
    var pieGraphInstance = useRef(null);

    useEffect(() => {
        if (!stockNames.length || !stockPopCount.length) return; // Ensure data is loaded before rendering
    
        const xValues = stockNames;
        const yValues = stockPopCount.map(count => parseInt(count, 10));

        if (pieGraphInstance.current) {
            pieGraphInstance.current.destroy();
        }
    
        const sliceColors = [
            '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
            '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
            '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5',
            '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5'
        ];
    
        pieGraphInstance.current = new Chart(popularityPieRef.current, {
            type: "doughnut",
            data: {
                labels: xValues,
                datasets: [
                    {
                        backgroundColor: sliceColors,
                        data: yValues
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                title: {
                    display: true,
                },
                cutout: "30%"
            }
        });
        return () => {
            if (pieGraphInstance.current) {
                pieGraphInstance.current.destroy();
            }
        };
    }, [stockNames, stockPopCount]);

    const popularityChartRefMonth = useRef(null);
        
    const scrollToChartRefMonth = () => {
        popularityChartRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMonthlyData = async () => {
        setLoadingPieChartMonth(true);
        try {
            const response = await fetch(`${SERVER}/monthly-product-popularity/${date}`);
            const data = await response.json();
            const nameArray = data.map(item => item.name);
            const countArray = data.map(item => item.count);

            setNameMonth(nameArray);
            setPopCountMonth(countArray);
        } catch (error) {
            console.error("Error fetching monthly data:", error);
        }
        setLoadingPieChartMonth(false);
    };

    const popularityPieMonthRef = useRef(null);
    var pieGraphMonthInstance = useRef(null);

    useEffect(() => {
        if (!stockNamesMonth.length || !stockPopCountMonth.length) return; // Ensure data is loaded before rendering
    
        const xValues = stockNamesMonth;
        const yValues = stockPopCountMonth.map(count => parseInt(count, 10));

        if (pieGraphMonthInstance.current) {
            pieGraphMonthInstance.current.destroy();
        }
    
        const sliceColors = [
            '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
            '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
            '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5',
            '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5'
        ];
    
        pieGraphMonthInstance.current = new Chart(popularityPieMonthRef.current, {
            type: "doughnut",
            data: {
                labels: xValues,
                datasets: [
                    {
                        backgroundColor: sliceColors,
                        data: yValues
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                title: {
                    display: true,
                },
                cutout: "30%"
            }
        });
        return () => {
            if (pieGraphMonthInstance.current) {
                pieGraphMonthInstance.current.destroy();
            }
        };
    }, [stockNamesMonth, stockPopCountMonth]);

    useEffect(() => {
        fetchDailyData();
        fetchMonthlyData();
    }, [date, timeframeInput]);

    console.log(timeframeInput);

    return (
        <div className="h-screen bg-[#3D2B1F] overflow-auto pb-8">
            <div className="sticky top-0 w-full z-50">
                <div className="flex justify-between items-center p-2 bg-white sticky top-0 w-full z-50 shadow-md border-b-[#3D2B1F] border-b-5">
                    <h1 className="text-3xl text-left font-bold text-black text-center bg-white sticky top-0 w-full">
                        Sales Trends
                    </h1> 
                    {/* Top Navigation */}
                    <div className="flex gap-4">
                        <button onClick={scrollToChartRef} className="w-40 py-5 rounded hover:bg-gray-400 bg-black text-white">
                            Popularity Chart
                        </button>
                        {/* <button onClick={scrollToXReport} className="w-40 rounded hover:bg-gray-400 bg-black text-white">
                            View Reports
                        </button> */}
                    </div> 
                </div>
                <div className="p-4 flex flex-col items-center">
                    <div className="m-4 bg-white w-auto p-4 rounded-lg mb-4 mt-0 flex flex-row">
                        <h2 className="block text-black text-xl font-bold mt-2 mr-2">Select Date:</h2>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="p-2 rounded text-black border-black border-2"
                        />
                        <h2 className="block text-black text-xl font-bold mt-2 ml-2 mr-2">Select Timeframe:</h2>
                        <select
                            id="shift"
                            value={timeframeInput}
                            onChange={(e) =>
                            setTimeFrame(e.target.value)
                            }
                            className="mt-1 p-2 w-fit border rounded-md shadow-sm text-black"
                        >
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Yearly">Yearly</option>
                        </select>
                    </div>
                    
                    <div className="flex flex-row justify-center items-start gap-x-8">
                        <div className="flex flex-col justify-center items-center bg-white rounded-lg">
                            <div className="mt-4 bg-white w-fit p-2 rounded-lg">
                                <h2 className="text-bflack text-xl font-bold">Daily Drink Popularity Chart</h2>
                            </div>

                        {loadingPieChart ? (
                            <div className="text-black bg-white m-4 p-6 rounded-lg mb-0 border-2 p-4 border-black mb-4">Loading...</div>
                        ) : stockNames.length === 0 ? (
                            <div className="text-black bg-white m-4 p-6 rounded-lg mb-0 border-2 p-4 border-black mb-4">No data on current date</div>
                        ) : timeframeInput === "Daily" ? (
                            <div className="bg-white m-4 p-6 rounded-lg border-2 p-4 h-[600px] border-black mb-4" ref={popularityChartRef}>
                                <div className="relative w-full h-full">
                                <canvas
                                    className="w-full h-full"
                                    ref={popularityPieRef}
                                />
                                </div>
                            </div>
                        ) : (
                            null
                        )}
                        </div>

                        <div className="flex flex-col justify-center items-center bg-white rounded-lg">
                            <div className="mt-4 bg-white w-fit p-2 rounded-lg">
                                <h2 className="text-black text-xl font-bold">Monthly Drink Popularity Chart</h2>
                            </div>

                        {loadingPieChartMonth ? (
                            <div className="text-black bg-white m-4 p-6 rounded-lg mb-0 border-2 p-4 border-black mb-4">Loading...</div>
                        ) : stockNamesMonth.length === 0 ? (
                            <div className="text-black bg-white m-4 p-6 rounded-lg mb-0 border-2 p-4 border-black mb-4">No data on current date</div>
                        ) : (
                            <div className="bg-white m-4 p-6 rounded-lg border-2 p-4 h-[600px] border-black mb-4" ref={popularityChartRef}>
                                <div className="relative w-full h-full">
                                <canvas
                                    className="w-full h-full"
                                    ref={popularityPieMonthRef}
                                />
                                </div>
                            </div>
                        )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
