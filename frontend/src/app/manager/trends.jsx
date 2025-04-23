"use client";
import { SERVER } from "@/app/const";
import { useState, useRef, useEffect } from "react";
import Nav from "@/app/nav";
import { Chart } from "chart.js/auto";
import datalabels from 'chartjs-plugin-datalabels';
Chart.register(datalabels);
import TranslateToggle from "../components/TranslateToggle";

export default function Trends() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loadingPieChart, setLoadingPieChart] = useState(false);
    const [stockNames, setName] = useState([]);
    const [stockPopCount, setPopCount] = useState([]);
    const [stockNamesWeek, setNameWeek] = useState([]);
    const [stockPopCountWeek, setPopCountWeek] = useState([]);
    const [stockNamesMonth, setNameMonth] = useState([]);
    const [stockPopCountMonth, setPopCountMonth] = useState([]);
    const [stockNamesYear, setNameYear] = useState([]);
    const [stockPopCountYear, setPopCountYear] = useState([]);
    const [timeframeInput, setTimeFrame] = useState("");
    const popularityChartRef = useRef(null);
    const popularityPieRef = useRef(null);
    var pieGraphInstance = useRef(null);
    const popularityPieWeekRef = useRef(null);
    var pieGraphWeekInstance = useRef(null);
    const popularityPieMonthRef = useRef(null);
    var pieGraphMonthInstance = useRef(null);
    const popularityPieYearRef = useRef(null);
    var pieGraphYearInstance = useRef(null);

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
            console.error("Error fetching daily data:", error);
        }
        setLoadingPieChart(false);
    };

    useEffect(() => {
        if (!stockNames.length || !stockPopCount.length || timeframeInput != "Daily") return; // Ensure data is loaded before rendering
    
        const xValues = stockNames;
        const yValues = stockPopCount.map(count => parseInt(count, 10));

        if (pieGraphInstance.current) {
            pieGraphInstance.current.destroy();
        }
        if (pieGraphWeekInstance.current) {
            pieGraphWeekInstance.current.destroy();
        }
        if (pieGraphMonthInstance.current) {
            pieGraphMonthInstance.current.destroy();
        }
        if (pieGraphYearInstance.current) {
            pieGraphYearInstance.current.destroy();
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
                cutout: "30%",
                plugins: {
                    datalabels: {
                        formatter: (value, context) => {
                            const data = context.chart.data.datasets[0].data;
                            const total = data.reduce((acc, val) => acc + val, 0);
                            const percentage = ((value / total) * 100).toFixed(2) + '%';
                            return `${percentage}`;
                        },
                        color: 'white',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                }
            }
        });
        popularityChartRef.current?.scrollIntoView({ behavior: "smooth" });
        return () => {
            if (pieGraphInstance.current) {
                pieGraphInstance.current.destroy();
            }
        };
    }, [stockNames, stockPopCount]);

    const fetchWeeklyData = async () => {
        setLoadingPieChart(true);
        try {
            const response = await fetch(`${SERVER}/weekly-product-popularity/${date}`);
            const data = await response.json();
            const nameArray = data.map(item => item.name);
            const countArray = data.map(item => item.count);

            setNameWeek(nameArray);
            setPopCountWeek(countArray);
        } catch (error) {
            console.error("Error fetching weekly data:", error);
        }
        setLoadingPieChart(false);
    };

    useEffect(() => {
        if (!stockNamesWeek.length || !stockPopCountWeek.length || timeframeInput != "Weekly") return; // Ensure data is loaded before rendering
    
        const xValues = stockNamesWeek;
        const yValues = stockPopCountWeek.map(count => parseInt(count, 10));

        if (pieGraphInstance.current) {
            pieGraphInstance.current.destroy();
        }
        if (pieGraphWeekInstance.current) {
            pieGraphWeekInstance.current.destroy();
        }
        if (pieGraphMonthInstance.current) {
            pieGraphMonthInstance.current.destroy();
        }
        if (pieGraphYearInstance.current) {
            pieGraphYearInstance.current.destroy();
        }
    
        const sliceColors = [
            '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
            '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
            '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5',
            '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5'
        ];
    
        pieGraphWeekInstance.current = new Chart(popularityPieWeekRef.current, {
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
                cutout: "30%",
                plugins: {
                    datalabels: {
                        formatter: (value, context) => {
                            const data = context.chart.data.datasets[0].data;
                            const total = data.reduce((acc, val) => acc + val, 0);
                            const percentage = ((value / total) * 100).toFixed(2) + '%';
                            return `${percentage}`;
                        },
                        color: 'white',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                }
            }
        });
        popularityChartRef.current?.scrollIntoView({ behavior: "smooth" });
        return () => {
            if (pieGraphWeekInstance.current) {
                pieGraphWeekInstance.current.destroy();
            }
        };
    }, [stockNamesWeek, stockPopCountWeek]);

    const fetchMonthlyData = async () => {
        setLoadingPieChart(true);
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
        setLoadingPieChart(false);
    };

    useEffect(() => {
        if (!stockNamesMonth.length || !stockPopCountMonth.length || timeframeInput != "Monthly") return; // Ensure data is loaded before rendering
    
        const xValues = stockNamesMonth;
        const yValues = stockPopCountMonth.map(count => parseInt(count, 10));

        if (pieGraphMonthInstance.current) {
            pieGraphMonthInstance.current.destroy();
        }
        if (pieGraphWeekInstance.current) {
            pieGraphWeekInstance.current.destroy();
        }
        if (pieGraphInstance.current) {
            pieGraphInstance.current.destroy();
        }
        if (pieGraphYearInstance.current) {
            pieGraphYearInstance.current.destroy();
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
                cutout: "30%",
                plugins: {
                    datalabels: {
                        formatter: (value, context) => {
                            const data = context.chart.data.datasets[0].data;
                            const total = data.reduce((acc, val) => acc + val, 0);
                            const percentage = ((value / total) * 100).toFixed(2) + '%';
                            return `${percentage}`;
                        },
                        color: 'white',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                }
            }            
        });
        popularityChartRef.current?.scrollIntoView({ behavior: "smooth" });
        return () => {
            if (pieGraphMonthInstance.current) {
                pieGraphMonthInstance.current.destroy();
            }
        };
    }, [stockNamesMonth, stockPopCountMonth]);

    const fetchYearlyData = async () => {
        setLoadingPieChart(true);
        try {
            const response = await fetch(`${SERVER}/yearly-product-popularity/${date}`);
            const data = await response.json();
            const nameArray = data.map(item => item.name);
            const countArray = data.map(item => item.count);

            setNameYear(nameArray);
            setPopCountYear(countArray);
        } catch (error) {
            console.error("Error fetching yearly data:", error);
        }
        setLoadingPieChart(false);
    };

    useEffect(() => {
        if (!stockNamesYear.length || !stockPopCountYear.length || timeframeInput != "Yearly") return; // Ensure data is loaded before rendering
    
        const xValues = stockNamesYear;
        const yValues = stockPopCountYear.map(count => parseInt(count, 10));

        if (pieGraphMonthInstance.current) {
            pieGraphMonthInstance.current.destroy();
        }
        if (pieGraphWeekInstance.current) {
            pieGraphWeekInstance.current.destroy();
        }
        if (pieGraphInstance.current) {
            pieGraphInstance.current.destroy();
        }
        if (pieGraphYearInstance.current) {
            pieGraphYearInstance.current.destroy();
        }
    
        const sliceColors = [
            '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
            '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
            '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5',
            '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5'
        ];
    
        pieGraphYearInstance.current = new Chart(popularityPieYearRef.current, {
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
                cutout: "30%",
                plugins: {
                    datalabels: {
                        formatter: (value, context) => {
                            const data = context.chart.data.datasets[0].data;
                            const total = data.reduce((acc, val) => acc + val, 0);
                            const percentage = ((value / total) * 100).toFixed(2) + '%';
                            return `${percentage}`;
                        },
                        color: 'white',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                }
            }
        });
        popularityChartRef.current?.scrollIntoView({ behavior: "smooth" });
        return () => {
            if (pieGraphYearInstance.current) {
                pieGraphYearInstance.current.destroy();
            }
        };
    }, [stockNamesYear, stockPopCountYear]);

    useEffect(() => {
        fetchDailyData();
        fetchWeeklyData();
        fetchMonthlyData();
        fetchYearlyData();
    }, [timeframeInput]);

    useEffect(() => {
        fetchDailyData();
        fetchWeeklyData();
        fetchMonthlyData();
        fetchYearlyData();
        setTimeFrame("");
    }, [date]);

    return (
        <div className="h-screen bg-[#3D2B1F] overflow-auto pb-8">
            <div className="sticky top-0 w-full z-50">
                <div className="flex justify-between items-center p-2 bg-white sticky top-0 z-50 shadow-md border-b-[#3D2B1F] border-b-5">
                    <h1 className="text-3xl text-left font-bold text-black text-center bg-white sticky top-0">
                        Sales Trends
                    </h1> 
                    {/* Top Navigation */}
                    <div className="flex gap-4">
                        <a href="/cashier" className="w-40 rounded hover:bg-gray-300 bg-[#EED9C4] text-black text-center inline-block py-5">
                            Cashier View
                        </a>
                        <button onClick={scrollToChartRef} className="w-40 py-5 rounded hover:bg-gray-600 bg-black text-white">
                            Popularity Chart
                        </button>
                    </div> 
                </div>
                <div className="p-4 flex flex-col items-center">
                    <div className="m-4 bg-white w-auto p-4 rounded-lg mb-4 mt-0 flex flex-row size-9/10">
                        <h2 className="block text-black text-xl font-bold mt-2 mr-2">Select Date:</h2>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="p-2 rounded text-black border-black border-2"
                        />
                        <h2 className="block text-black text-xl font-bold pl-20 mt-2 ml-2 mr-2">Select Timeframe:</h2>
                        <select
                            id="shift"
                            value={timeframeInput}
                            onChange={(e) =>
                            setTimeFrame(e.target.value)
                            }
                            className="mt-1 p-2 w-fit border rounded-md shadow-sm text-black"
                        >
                            <option value="" disabled>Select a Timeframe</option>
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Yearly">Yearly</option>
                        </select>
                    </div>
                    
                    <div className="flex flex-row justify-center items-start gap-x-8">
                        <div className="flex flex-col justify-center items-center bg-white rounded-lg">
                            <div className="mt-4 bg-white w-fit p-2 pb-0 rounded-lg">
                                <h2 className="text-black text-xl font-bold p-4">{timeframeInput} Popularity Chart</h2>
                            </div>

                        {loadingPieChart ? (
                            <div className="text-black bg-white m-4 p-6 rounded-lg mb-0 border-2 p-4 border-black mb-4">Loading...</div>
                        ) :  timeframeInput === "" ? (
                            <div className="text-black bg-white m-4 p-6 rounded-lg mb-0 border-2 p-4 border-black mb-4">Select a timeframe to continue</div>
                        ) : stockNames.length === 0 && stockNamesWeek.length === 0 && stockNamesMonth.length === 0 && stockNamesYear.length === 0 ? (
                            <div className="text-black bg-white m-4 p-6 rounded-lg mb-0 border-2 p-4 border-black mb-4">No data on current date</div>
                        ) : timeframeInput === "Daily" && stockNames.length > 0 ? (
                            <div className="bg-white m-4 p-6 rounded-lg border-2 p-4 h-[600px] border-black mb-4" ref={popularityChartRef}>
                                <div className="relative w-full h-full">
                                <canvas
                                    className="w-full h-full"
                                    ref={popularityPieRef}
                                />
                                </div>
                            </div>
                        ) : timeframeInput === "Weekly" && stockNamesWeek.length > 0 ? ( 
                            <div className="bg-white m-4 p-6 rounded-lg border-2 p-4 h-[600px] border-black mb-4" ref={popularityChartRef}>
                                <div className="relative w-full h-full">
                                <canvas
                                    className="w-full h-full"
                                    ref={popularityPieWeekRef}
                                />
                                </div>
                            </div>
                        ) : timeframeInput === "Monthly" && stockNamesMonth.length > 0 ? (
                            <div className="bg-white m-4 p-6 rounded-lg border-2 p-4 h-[600px] border-black mb-4" ref={popularityChartRef}>
                                <div className="relative w-full h-full">
                                <canvas
                                    className="w-full h-full"
                                    ref={popularityPieMonthRef}
                                />
                                </div>
                            </div>
                        ) : timeframeInput === "Yearly" && stockNamesYear.length > 0 ? (
                            <div className="bg-white m-4 p-6 rounded-lg border-2 p-4 h-[600px] border-black mb-4" ref={popularityChartRef}>
                                <div className="relative w-full h-full">
                                <canvas
                                    className="w-full h-full"
                                    ref={popularityPieYearRef}
                                />
                                </div>
                            </div>
                        ) : (
                            <div className="text-black bg-white m-4 p-6 rounded-lg mb-0 border-2 p-4 border-black mb-4">No data on current date</div>
                        )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
