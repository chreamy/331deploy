"use client";
import { SERVER } from "@/app/const";
import { useState, useEffect, useRef } from "react";
import Nav from "@/app/nav";
import { FaPlay, FaPlayCircle } from "react-icons/fa";

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
    const [loadingChart, setLoadingChart] = useState(false);
    const [visibleLines, setVisibleLines] = useState({});
    const [hoveredLine, setHoveredLine] = useState(null);
    const [xReport, setXReport] = useState(null);
    const [zReport, setZReport] = useState(null);
    const [loadingXReport, setLoadingXRep] = useState(false);
    const [XReportButton, setXReportButton] = useState(false);
    const [ZReportButton, setZReportButton] = useState(false);

    const fetchHourlyData = async () => {
        setLoadingChart(true);
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
        setLoadingChart(false);
    };

    const fetchXReport = async () => {
        try {
            setLoadingXRep(true);
            const response = await fetch(`${SERVER}/x-report/${date}`);
            const data = await response.json();
            console.log("Fetched X-Report:", data);
            setXReport(data);
            setXReportButton(false);
        } catch (error) {
            console.error("Error fetching X-Report:", error);
        }
        setLoadingXRep(false);
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

    const productUsageRef = useRef(null);
    
        const scrollToProductUsage = () => {
            productUsageRef.current?.scrollIntoView({ behavior: "smooth" });
        };
    
        const ReportRef= useRef(null);
    
        const scrollToXReport = () => {
            ReportRef.current?.scrollIntoView({ behavior: "smooth" });
        };

    return (
        <div className="overflow-auto h-screen">
            <div className="flex-1 bg-[#3D2B1F] pb-4">
                <div className="flex justify-between items-center p-2 bg-white sticky top-0 w-full shadow-md z-50 border-b-[#3D2B1F] border-b-5">
                    <h1 className="text-3xl text-left font-bold text-black text-center bg-white sticky top-0 w-full">
                        Manage Reports
                    </h1> 
                    {/* Top Navigation */}
                    <div className="flex gap-4">
                        <button onClick={scrollToProductUsage} className="w-40 rounded hover:bg-gray-400 bg-black text-white">
                            Product Usage
                        </button>
                        <button onClick={scrollToXReport} className="w-40 py-5 rounded hover:bg-gray-400 bg-black text-white">
                            View Reports
                        </button>
                    </div>    
                </div>  
                
                <div className="p-4 flex flex-col items-center">
                    <div className="m-4 bg-white w-fit p-4 rounded-lg mb-4 mt-0">
                        <h2 className="block text-black text-xl font-bold mb-2">Select Report Date:</h2>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => {setDate(e.target.value); setXReportButton(false);}}
                            className="p-2 rounded text-black border-black border-2"
                        />
                    </div>

                    <div className="m-4 bg-white w-fit p-4 rounded-lg mb-0 justify-center items-center" ref={productUsageRef}>
                        <h2 className="block text-black text-xl font-bold" >Product Usage Chart</h2>
                    </div>

                    {loadingChart ? (
                        <div className="text-black bg-white m-4 p-6 rounded-lg mb-0">Loading...</div>
                    ) : hourlyData.length === 0 ? (
                        <div className="text-black bg-white m-4 p-6 rounded-lg mb-0">No data on current date</div>
                    ) : (
                        <div className="bg-white m-4 mb-0 p-6 flex flex-col h-[600px] rounded-lg">
                            <div className="relative h-full">
                                {/* Y-axis labels */}
                                <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between">
                                    {[maxValue, maxValue/2, 0].map((value) => (
                                        <div key={value} className="text-black text-xs">
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
                                        <div key={hour} className="text-black text-xs" style={{ transform: 'rotate(-45deg)', transformOrigin: 'left' }}>
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
                                        <span className="text-black">{product}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            <div className="flex flex-row justify-center items-start gap-x-8">
                <div className="flex flex-col justify-center items-center">
                    <div className="mt-4 bg-white w-fit p-4 rounded-lg">
                        <h2 className="text-xl font-bold text-black" ref={ReportRef}>X-Report</h2>
                    </div>
                    <button
                        onClick={() => setXReportButton(true)}
                        className="rounded hover:bg-blue-400 bg-green-400 text-black font-bold p-4 flex items-center space-x-2 mt-4"
                    >
                        <FaPlayCircle className="text-3xl" />
                        <span>Generate</span>
                    </button>

                    {loadingXReport ? (
                        <div className="text-black bg-white m-4 p-6 rounded-lg mb-0">Loading...</div>
                    ) : !XReportButton ? (
                        <div className="text-black bg-white m-4 p-6 rounded-lg mb-0">Generate X-Report to continue</div>
                    ) : hourlyData.length === 0 ? (
                        <div className="text-black bg-white m-4 p-6 rounded-lg mb-0">No data on current date</div> 
                    ) : (
                        <div className="m-4 p-6 mb-0 w-auto bg-white bg-gray-800 p-6 rounded-lg w-xl">
                        {/* X-Report Section */}
                        {xReport ? (
                            <table className="w-full text-black text-sm">
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
                            <div className="text-white">No report data available.</div> // Optional fallback
                        )}
                    </div>
                )}
                </div>
                    
                <div className="flex flex-col justify-center items-center">
                    <div className="mt-4 bg-white w-fit p-4 rounded-lg">
                        <h2 className="text-xl font-bold text-black" ref={ReportRef}>Z-Report</h2>
                    </div>

                    <button
                        onClick={() => setZReportButton(true)}
                        className="rounded hover:bg-blue-400 bg-green-400 text-black font-bold p-4 flex items-center space-x-2 mt-4"
                    >
                        <FaPlayCircle className="text-3xl" />
                        <span>Generate</span>
                    </button>

                    {loadingChart ? (
                    <div className="text-black bg-white m-4 p-6 rounded-lg mb-0">Loading...</div>
                    ) : hourlyData.length === 0 ? (
                    <div className="text-black bg-white m-4 p-6 rounded-lg mb-0">No data on current date</div>
                    ) : !ZReportButton ? (
                        <div className="text-black bg-white m-4 p-6 rounded-lg mb-0">Generate X-Report to continue</div>
                    ) : (
                    <div className="bg-white m-4 p-6 rounded-lg w-xl">
                        {/* Z-Report Section */}
                        {zReport ? (
                        <ul className="list-disc list-inside text-black text-md">
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
                    )}
                </div> 
            </div>
        </div>
    </div>
    );
}