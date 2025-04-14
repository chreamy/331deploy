"use client";
import { SERVER } from "@/app/const";
import { useState, useEffect } from "react";
import Nav from "@/app/nav";

// Expanded color palette for more variety
const COLORS = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
    '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5',
    '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5'
];

export default function Reports() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [hourlyData, setHourlyData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visibleLines, setVisibleLines] = useState({});
    const [hoveredLine, setHoveredLine] = useState(null);
    const [xReport, setXReport] = useState(null);
    const [zReport, setZReport] = useState(null);

    const fetchHourlyData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${SERVER}/hourly-product-usage/${date}`);
            const data = await response.json();
            console.log("Fetched data:", data);
            setHourlyData(data);
            // Initialize visibility state
            const initialVisibility = data.reduce((acc, item) => {
                acc[item.name] = true;
                return acc;
            }, {});
            setVisibleLines(initialVisibility);
        } catch (error) {
            console.error("Error fetching hourly data:", error);
        }
        setLoading(false);
    };

    const fetchXReport = async () => {
        try {
            const response = await fetch(`${SERVER}/x-report/${date}`);
            const data = await response.json();
            console.log("Fetched X-Report:", data);
            setXReport(data);
        } catch (error) {
            console.error("Error fetching X-Report:", error);
        }
    };

    const fetchZReport = async () => {
        try {
            const response = await fetch(`${SERVER}/z-report/${date}`);
            const data = await response.json();
            setZReport(data);
        } catch (error) {
            console.error("Error fetching Z-Report:", error);
        }
    };

    useEffect(() => {
        fetchHourlyData();
        fetchXReport();
        fetchZReport();
    }, [date]);

    // Group data by product name
    const groupedData = hourlyData.reduce((acc, item) => {
        if (!acc[item.name]) {
            acc[item.name] = Array(24).fill(0);
        }
        acc[item.name][item.hour] = parseInt(item.count);
        return acc;
    }, {});

    // Find the maximum value for scaling
    const maxValue = Math.max(...Object.values(groupedData).flat());

    const toggleLineVisibility = (product) => {
        setVisibleLines((prev) => ({
            ...prev,
            [product]: !prev[product],
        }));
    };

    return (
        <div className="overflow-auto h-screen">
            <div className={`flex-1 bg-gradient-to-b from-gray-900 to-gray-700 border-l-6 border-black`}>
                <h1 className="text-3xl text-left font-bold text-black p-4 text-center bg-neutral-400 sticky top-0 w-full z-500">
                    Manager Reports
                </h1>

                {/* Top Navigation */}
                <div className="w-full bg-gray-800 text-white flex justify-center gap-4 py-4 z-50 shadow-md">
                    <button onClick={() => scrollToSection('section1')} className="px-4 py-2 rounded hover:bg-gray-600">
                    Section 1
                    </button>
                    <button onClick={() => scrollToSection('section2')} className="px-4 py-2 rounded hover:bg-gray-600">
                    Section 2
                    </button>
                    <button onClick={() => scrollToSection('section3')} className="px-4 py-2 rounded hover:bg-gray-600">
                    Section 3
                    </button>
                </div>
                
                <div className="p-4">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-white mb-4">Product Usage Chart</h2>
                        <label className="block text-white mb-2">Select Date:</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="p-2 rounded"
                        />
                    </div>

                    {loading ? (
                        <div className="text-white">Loading...</div>
                    ) : hourlyData.length === 0 ? (
                        <div className="text-white">No data on current date</div>
                    ) : (
                        <div className="bg-gray-800 p-6 flex flex-col h-[600px] rounded-lg">
                            <div className="relative h-full">
                                {/* Y-axis labels */}
                                <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between">
                                    {[maxValue, maxValue/2, 0].map((value) => (
                                        <div key={value} className="text-white text-xs">
                                            {value}
                                        </div>
                                    ))}
                                </div>

                                {/* Graph area */}
                                <div className="absolute left-8 right-0 top-0 bottom-8 overflow-hidden">
                                    {/* Lines */}
                                    {Object.entries(groupedData).map(([product, hours], index) => (
                                        visibleLines[product] && (
                                            <svg
                                                key={product}
                                                className="absolute top-0 left-0 w-full h-full"
                                                viewBox="0 0 100 100"
                                                preserveAspectRatio="none"
                                            >
                                                <path
                                                    d={hours.slice(11, 23).map((value, hour) => {
                                                        const x = (hour / 11) * 100;
                                                        const y = 100 - (value / maxValue) * 100;
                                                        return `${hour === 0 ? 'M' : 'L'} ${x} ${y}`;
                                                    }).join(' ')}
                                                    stroke={COLORS[index % COLORS.length]}
                                                    strokeWidth={hoveredLine === product ? "1.5" : "0.5"}
                                                    fill="none"
                                                />
                                            </svg>
                                        )
                                    ))}
                                </div>

                                {/* X-axis labels */}
                                <div className="absolute bottom-0 left-8 right-0 flex justify-between">
                                    {Array.from({length: 12}, (_, i) => i + 11).map((hour) => (
                                        <div key={hour} className="text-white text-xs" style={{ transform: 'rotate(-45deg)', transformOrigin: 'left' }}>
                                            {hour}:00
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="mt-4 flex flex-wrap gap-4">
                                {Object.keys(groupedData).map((product, index) => (
                                    <div
                                        key={product}
                                        className="flex items-center cursor-pointer"
                                        onClick={() => toggleLineVisibility(product)}
                                        onMouseEnter={() => setHoveredLine(product)}
                                        onMouseLeave={() => setHoveredLine(null)}
                                        style={{ opacity: visibleLines[product] ? 1 : 0.5 }}
                                    >
                                        <div
                                            className="w-4 h-4 mr-2"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <span className="text-white">{product}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* X-Report Section */}
                <div className="mt-8 bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-bold text-white mb-4">X-Report</h2>
                    {xReport ? (
                        <table className="w-full text-white text-xs">
                            <thead>
                                <tr>
                                    <th className="border-b border-gray-600 p-2 text-left">Hour</th>
                                    <th className="border-b border-gray-600 p-2 text-left">Total Orders</th>
                                    <th className="border-b border-gray-600 p-2 text-left">Total Sales</th>
                                </tr>
                            </thead>
                            <tbody>
                                {xReport.map((row, index) => (
                                    <tr key={index}>
                                        <td className="border-b border-gray-600 p-2">{row.hour}:00</td>
                                        <td className="border-b border-gray-600 p-2">{row.totalOrders}</td>
                                        <td className="border-b border-gray-600 p-2">${row.totalSales.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-white">Loading X-Report...</div>
                    )}
                </div>

                {/* Z-Report Section */}
                <div className="mt-8 bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-bold text-white mb-4">Z-Report</h2>
                    {zReport ? (
                        <ul className="list-disc list-inside text-white text-xs">
                            <li>Total Revenue: ${zReport.totalRevenue}</li>
                            <li>Total Tax: ${zReport.totalTax}</li>
                            <li>Total Profit: ${zReport.totalProfit}</li>
                            <li>Total Drinks Sold: {zReport.totalDrinks}</li>
                            <li>Total Orders: {zReport.totalOrders}</li>
                            <li>Total Toppings Used: {zReport.totalToppings}</li>
                        </ul>
                    ) : (
                        <div className="text-white">Loading Z-Report...</div>
                    )}
                </div>
            </div>
        </div>
    );
}
