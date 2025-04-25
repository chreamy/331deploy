"use client";
import { SERVER } from "@/app/const";
import { useState, useEffect, useRef } from "react";
import Nav from "@/app/nav";
import { FaPlay, FaPlayCircle } from "react-icons/fa";
import TranslateToggle from "../components/TranslateToggle";

// Expanded color palette for more variety
const COLORS = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
    '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5',
    '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5'
];

export default function Reports() {
    // set states
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [hourlyData, setHourlyData] = useState([]);
    const [loadingChart, setLoadingChart] = useState(false);
    const [visibleLines, setVisibleLines] = useState({});
    const [hoveredLine, setHoveredLine] = useState(null);
    const [xReport, setXReport] = useState(null);
    const [zReport, setZReport] = useState(null);
    const [loadingXReport, setLoadingXRep] = useState(false);
    const [loadingZReport, setLoadingZRep] = useState(false);
    const [XReportButton, setXReportButton] = useState(false);
    const [ZReportButton, setZReportButton] = useState(false);

    // set reference states for scroll functionalities
    const productUsageRef = useRef(null);
    const ReportRef= useRef(null);

    const scrollToProductUsage = () => {
        productUsageRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    
    const scrollToXReport = () => {
        ReportRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Fetch hourly data from today from the PostgreSQL database
    const fetchHourlyData = async () => {
        setLoadingChart(true);
        try {
            const response = await fetch(`${SERVER}/hourly-product-usage/${date}`);
            const data = await response.json();
            //console.log("Fetched data:", data);
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

    // Fetch X-Report information from the PostgreSQL database
    const fetchXReport = async () => {
        setLoadingXRep(true);
        try {
            const response = await fetch(`${SERVER}/x-report/${date}`);
            const data = await response.json();
            //console.log("Fetched X-Report:", data);
            setXReport(data);
        } catch (error) {
            console.error("Error fetching X-Report:", error);
        }
        setLoadingXRep(false);
    };

    // Fetch Z-Report information from the PotgreSQL database
    const fetchZReport = async () => {
        setLoadingZRep(true);
        try {
            const response = await fetch(`${SERVER}/z-report/${date}`);
            const data = await response.json();
            setZReport(data);
        } catch (error) {
            console.error("Error fetching Z-Report:", error);
        }
        setLoadingZRep(false);
    };

    useEffect(() => {
        fetchHourlyData();
        fetchXReport();
        fetchZReport();
    }, [date]);

    // Function when X-Report is regenerated
    const refetchXReport = async () => {
        await fetchXReport();
        await checkZReport();
        setXReportButton(true);
        setTimeout(() => {
            ReportRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100)
    };

    // Function that handles whenever Z-Report is regenerated
    const refetchZReport = async () => {
        await fetchZReport();
        await updateZReport();
        setZReportButton(true);
        ReportRef.current?.scrollIntoView({ behavior: "smooth" });
    };

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
    
    // Function that updates PostgreSQL database whenever the generate button is pressed
    const updateZReport = async () => {
        setLoadingZRep(true);
        try {
            const response = await fetch(`${SERVER}/updateZReport`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify( {date} ),
            });

            const data = await response.json();

            const message = String(data.message);
            if (message === "Z-Report has already been generated") {
                showNotification(message);
            }

            if (!response.ok) {
                throw new Error("Failed to update Z-Report");
            }
        } catch (error) {
            console.error("Error updating Z-Report:", error);
        }
        setLoadingZRep(false);
    };

    // Function that checks the PostgreSQL database if Z-Report has already been run for the day
    const checkZReport = async () => {
        setLoadingXRep(true);
        try {
            const response = await fetch(`${SERVER}/checkZReport`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify( {date} ),
            });

            const data = await response.json();

            const message = String(data.message);
            if (message === "Z-Report has already been generated") {
                showNotification(message);
            }

            if (!response.ok) {
                throw new Error("Failed to check Z-Report");
            }
        } catch (error) {
            console.error("Error checking Z-Report:", error);
        }
        setLoadingXRep(false);
    };

    const [notification, setNotification] = useState({ message: '', type: '' });
    const timeoutRef = useRef(null);

    // Functionality to show updates for whenever reports are generated
    const showNotification = (message, type = 'Success') => {
        setNotification({ message: `${message}`, type });
       
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setNotification({ message: '', type: ',' });
        }, 3000);
    };

    const getBackground = () => {
        return notification.type === 'Success'
            ? 'bg-blue-500'
            : notification.type === 'Error'
            ? 'bg-red-500'
            : 'bg-gray-400';
    };

    //console.log(groupedData);

    return (
        <div className="h-screen bg-[#3D2B1F] overflow-auto pb-8">
            <div className="sticky top-0 w-full z-50">
                <div className="flex justify-between items-center p-2 bg-white sticky top-0 w-full z-50 shadow-md border-b-[#3D2B1F] border-b-5">
                   <h1 className="text-3xl text-left font-bold text-black text-center bg-white sticky top-0">
                        Manage Reports
                    </h1> 
                    {notification.message && (
                        <div className={`absolute right-3 top-23 z-50 px-6 py-4 rounded shadow-md text-white text-xl font-bold ${getBackground()}`}>
                        {notification.message}
                    </div>
                    )}
                    {/* Top Navigation */}
                    <div className="flex gap-4">
                        <a href="/cashier" className="w-40 rounded hover:bg-gray-300 bg-[#EED9C4] text-black text-center inline-block py-5">
                            Cashier View
                        </a>
                        <button onClick={scrollToProductUsage} className="w-40 rounded hover:bg-gray-600 bg-black text-white">
                            Product Usage
                        </button>
                        <button onClick={scrollToXReport} className="w-40 py-5 rounded hover:bg-gray-600 bg-black text-white">
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
                            onChange={(e) => {setDate(e.target.value); setXReportButton(false); setZReportButton(false);}}
                            className="p-2 rounded text-black border-black border-2 content-center"
                        />
                    </div>
                    
                    <div className="bg-white items-center content-center rounded-lg mb-4">
                        <div className="w-full p-2 rounded-lg mt-3" ref={productUsageRef}>
                            <div className="w-full flex justify-center">
                                <h2 className="text-black text-xl font-bold">Product Usage Chart</h2>
                            </div>
                        </div>

                        {loadingChart ? (
                            <div className="text-black bg-white m-4 p-6 rounded-lg mb-0 border-2 p-4 border-black mb-4">Loading...</div>
                        ) : hourlyData.length === 0 ? (
                            <div className="text-black bg-white m-4 p-6 rounded-lg mb-0 border-2 p-4 border-black mb-4">No data on current date</div>
                        ) : (
                            <div className="bg-white m-4 mb-0 p-6 flex flex-col h-[600px] w-[1100px] rounded-lg border-2 p-4 border-black mb-4">
                                <div className="relative h-full">
                                    {/* Y-axis labels */}
                                    <div className="absolute left-4 -top-1 bottom-6 w-8 flex flex-col justify-between">
                                        {[maxValue, maxValue/2, 0].map((value) => (
                                            <div key={value} className="text-black text-xs">
                                                {value}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Graph area */}
                                    <div className="absolute left-8 right-0 top-0 bottom-8 overflow-hidden bg-gray-100 border-black border-1">
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
                                                        d={hours.slice(11, 24).map((value, hour) => {
                                                            const x = (hour / 12) * 100;
                                                            //console.log(hour);
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
                                    <div className="absolute -bottom-1 left-4 -right-2 flex justify-between">
                                        {Array.from({length: 13}, (_, i) => i + 11).map((hour) => (
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
                </div>

            <div className="flex flex-row justify-center items-start gap-x-8">
                <div className="flex flex-col justify-center items-center bg-white rounded-lg">
                    <div className="mt-4 bg-white w-fit p-2 rounded-lg">
                        <h2 className="text-xl font-bold text-black">X-Report</h2>
                    </div>
                    <button
                        onClick={() => {setXReportButton(true); refetchXReport();}}
                        disabled = {loadingXReport}
                        className="rounded transform transition duration-200 hover:scale-120 bg-green-400 text-black font-bold p-4 flex items-center space-x-2 mt-4"
                    >
                        <FaPlayCircle className="text-3xl" />
                        <span>Generate</span>
                    </button>

                    {loadingXReport ? (
                        <div className="text-black bg-white m-4 p-6 rounded-lg mb-0 px-25 border-2 border-black mb-4">Loading...</div>
                    ) : !XReportButton ? (
                        <div className="text-black bg-white m-4 p-6 rounded-lg mb-0 border-2 border-black mb-4">Generate X-Report to continue</div>
                    ) : hourlyData.length === 0 ? (
                        <div className="text-black bg-white m-4 p-6 rounded-lg mb-0 border-2 border-black mb-4">No data on current date</div> 
                    ) : (
                        <div className="m-4 p-6 mb-0 w-auto bg-white bg-gray-800 p-6 rounded-lg w-xl border-2 border-black mb-4" ref={ReportRef}>
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
                            <div className="text-white">No report data available.</div> 
                        )}
                    </div>
                )}
                </div>
                    
                <div className="flex flex-col justify-center items-center bg-white rounded-lg">
                    <div className="mt-4 bg-white w-fit p-2 rounded-lg">
                        <h2 className="text-xl font-bold text-black">Z-Report</h2>
                    </div>

                    <button
                        onClick={() => {setZReportButton(true); refetchZReport();}}
                        disabled = {loadingZReport}
                        className="rounded transform transition duration-200 hover:scale-120 bg-green-400 text-black font-bold p-4 flex items-center space-x-2 mt-4"
                    >
                        <FaPlayCircle className="text-3xl" />
                        <span>Generate</span>
                    </button>

                    {loadingZReport ? (
                    <div className="text-black bg-white m-4 p-6 rounded-lg mb-0 px-25 border-2 border-black mb-4">Loading...</div>
                    ) : !ZReportButton ? (
                        <div className="text-black bg-white m-4 p-6 rounded-lg mb-0 border-2 border-black mb-4">Generate Z-Report to continue</div>
                    ) : hourlyData.length === 0 ? (
                        <div className="text-black bg-white m-4 p-6 rounded-lg mb-0 border-2 border-black mb-4">No data on current date</div>
                    ) : (
                    <div className="bg-white m-4 p-6 rounded-lg w-xl border-2 border-black mb-4">
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