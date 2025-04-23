const express = require("express");
const { Pool } = require("pg");
const dotenv = require("dotenv").config();
const cors = require("cors");

// Create express app
const app = express();
const port = 3000;

const corsOptions = {
    origin: (origin, callback) => {
        callback(null, true);
    },
};

app.use(express.json());
app.use(cors(corsOptions));
const pool = new Pool({
    user: process.env.PSQL_USER,
    host: process.env.PSQL_HOST,
    database: process.env.PSQL_DATABASE,
    password: process.env.PSQL_PASSWORD,
    port: process.env.PSQL_PORT,
    ssl: { rejectUnauthorized: false },
});
process.on("SIGINT", function () {
    pool.end();
    console.log("Application successfully shutdown");
    process.exit(0);
});

app.set("view engine", "ejs");

app.get("/drinks", (req, res) => {
    drinks = [];
    pool.query("SELECT * FROM drinks;").then((query_res) => {
        for (let i = 0; i < query_res.rowCount; i++) {
            drinks.push(query_res.rows[i]);
        }
        const data = { drinks: drinks };
        //console.log(drinks);
        res.send({ drinks: data });
    });
});

app.get("/modifications", (req, res) => {
    modifications = [];
    pool.query("SELECT * FROM modifications;").then((query_res) => {
        for (let i = 0; i < query_res.rowCount; i++) {
            modifications.push(query_res.rows[i]);
        }
        res.send({ modifications: modifications });
    });
});

app.get("/toppings", (req, res) => {
    toppings = [];
    pool.query("SELECT * FROM toppings;").then((query_res) => {
        for (let i = 0; i < query_res.rowCount; i++) {
            toppings.push(query_res.rows[i]);
        }
        res.send({ toppings: toppings });
    });
});

app.get("/uniqueCategories", (req, res) => {
    categories = [];
    pool.query("SELECT * FROM categories;").then((query_res) => {
        for (let i = 0; i < query_res.rowCount; i++) {
            categories.push(query_res.rows[i]);
        }
        const data = { categories: categories };
        res.send({ categories: data });
    });
});

app.get("/stock", (req, res) => {
    stock = [];
    pool.query(
        "SELECT name, quantity FROM inventory order by quantity asc;"
    ).then((query_res) => {
        for (let i = 0; i < query_res.rowCount; i++) {
            stock.push(query_res.rows[i]);
        }
        res.send({ stock });
    });
});

app.get("/employees", (req, res) => {
    employees = [];
    pool.query("SELECT * FROM employees;").then((query_res) => {
        for (let i = 0; i < query_res.rowCount; i++) {
            employees.push(query_res.rows[i]);
        };
        res.send({ employees });
    });
});

app.post("/updateEmployee", async (req, res) => {
    const { id, shifttimings, role } = req.body;

    try {
        if (role === null) {
            await pool.query('UPDATE employees SET shifttimings = ($1) where id = ($2)', [shifttimings, id]);
        }

        else if (shifttimings === null) {
            await pool.query('UPDATE employees SET role = ($1) where id = ($2)', [role, id]);
        }

        else { // update all
            await pool.query('UPDATE employees SET role = ($1), shifttimings = ($2) where id = ($3)', [role, shifttimings, id]);
        }

        res.status(200).json({
            message: 'Employee updated',
        });
    }
    catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Server error occurred' });
    }
})

app.post("/updateInventory", async (req, res) => {
    const { name, price, quantity } = req.body;

    try {
        if (price === null) {
            await pool.query('UPDATE inventory SET quantity = ($1) where name = ($2)', [quantity, name]);
        }

        else if (quantity === null) {
            await pool.query('UPDATE inventory SET price = ($1) where name = ($2)', [price, name]);
        }

        else { // update all
            await pool.query('UPDATE inventory SET price = ($1), quantity = ($2) where name = ($3)', [price, quantity, name]);
        }

        res.status(200).json({
            message: 'Inventory updated',
        });
    }
    catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Server error occurred' });
    }
})

app.delete("/fireEmployee", async (req, res) => {
    const { id } = req.body;

    try {
        await pool.query('DELETE FROM employees where id = ($1)', [id]);
        
        res.status(200).json({
            message: 'Employee removed',
        });
    }
    catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Server error occurred' });
    }
})

app.get("/inventory", (req, res) => {
    inventory = [];
    pool.query(
        "SELECT i.name AS drink_name, i.price, di.drinkid, di.inventoryid, c.categoryid, c.categoryname FROM inventory AS i INNER JOIN drink_inventory AS di ON i.id = di.inventoryid INNER JOIN (SELECT ca.name AS categoryname, cd.categoryid, cd.drinkid FROM categories AS ca JOIN categories_drink AS cd ON ca.id = cd.categoryid) AS c ON di.drinkid = c.drinkid order by drink_name asc;"
    )
        .then((drinkQueryRes) => {
            drinkQueryRes.rows.forEach((row) => {
                inventory.push({
                    name: row.drink_name,
                    price: row.price,
                    drinkid: row.drinkid,
                    toppingid: null,
                    inventoryid: row.inventoryid,
                    categoryid: row.categoryid,
                    categoryname: row.categoryname,
                });
            });

            return pool.query(
                "SELECT name, price, toppingid, inventoryid FROM inventory INNER JOIN topping_inventory ON inventory.id = topping_inventory.inventoryid order by name asc;"
            );
        })
        .then((toppingQueryRes) => {
            toppingQueryRes.rows.forEach((row) => {
                inventory.push({
                    name: row.name,
                    price: row.price,
                    drinkid: null,
                    toppingid: row.toppingid,
                    inventoryid: row.inventoryid,
                    categoryid: null,
                    categoryname: null,
                });
            });

            res.send({ inventory });
        });
});

app.get("/categories", (req, res) => {
    pool.query(
        `SELECT json_object_agg(category, drinks) AS result
         FROM (
           SELECT 
             c.name AS category,
             json_agg(
               json_build_object(
                 'id', d.id,
                 'name', d.name,
                 'price', d.price
               )
             ) AS drinks
           FROM categories c
           JOIN categories_drink cd ON c.id = cd.categoryid
           JOIN drinks d ON cd.drinkid = d.id
           GROUP BY c.name
         ) AS sub;`
    )
        .then((query_res) => {
            res.send(query_res.rows[0].result);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error retrieving categories");
        });
});

app.get("/drink-options/:drink_id", async (req, res) => {
    try {
        // Get all toppings regardless of drink
        const toppingsQuery = `SELECT name, price FROM toppings`;
        const toppingsResult = await pool.query(toppingsQuery);

        const modificationsQuery = `SELECT name FROM modifications`;
        const modificationsResult = await pool.query(modificationsQuery);

        const modMap = {};
        modificationsResult.rows.forEach(({ name }) => {
            const type = name.includes("Ice")
                ? "Ice"
                : name.includes("Sugar")
                ? "Sugar"
                : "Other";

            if (!modMap[type]) modMap[type] = [];
            modMap[type].push(name);
        });

        const groupedModifications = Object.entries(modMap).map(
            ([type, options]) => ({
                type,
                options,
            })
        );

        res.json({
            toppings: toppingsResult.rows,
            modifications: groupedModifications,
        });
    } catch (err) {
        console.error("Error fetching drink options:", err);
        res.status(500).json({ error: "Failed to fetch drink options" });
    }
});

app.delete("/removeDrink", async (req, res) => {
    try {
        const { name, drinkid } = req.body;

        await pool.query("DELETE FROM drink_inventory where drinkid = ($1)", [
            drinkid,
        ]);

        await pool.query("DELETE FROM categories_drink where drinkid = ($1)", [
            drinkid,
        ]);

        await pool.query("DELETE FROM inventory where name = ($1)", [name]);

        await pool.query("DELETE FROM drinks where name = ($1)", [name]);

        res.status(200).json({
            message: "Item successfully deleted",
        });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Server error occurred" });
    }
});

app.delete("/removeTopping", async (req, res) => {
    try {
        const { name, toppingid } = req.body;

        await pool.query(
            "DELETE FROM topping_inventory WHERE toppingid = ($1)",
            [toppingid]
        );

        await pool.query("DELETE FROM toppings WHERE id = ($1)", [toppingid]);

        await pool.query("DELETE FROM inventory where name = ($1)", [name]);

        res.status(200).json({
            message: "Item successfully deleted",
        });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Server error occurred" });
    }
});

app.post("/addInventory", async (req, res) => {
    try {
        const {
            name,
            quantityInput,
            priceInput,
            selectedCategoryInput,
        } = req.body;

        if (
            !name ||
            !quantityInput ||
            !priceInput ||
            !selectedCategoryInput
        ) {
            return res.status(400).json({ error: "Missing fields" });
        }

        if (parseFloat(priceInput) < 0 || parseFloat(quantityInput) < 0) {
            return res.status(400).json({ error: "Invalid fields" });
        }

        const drinkCheck = await pool.query(
            "SELECT count(*) FROM drinks where name = ($1)",
            [name]
        );
        const nameExists = parseInt(drinkCheck.rows[0].count, 10); // convert to int

        if (nameExists > 0) {
            return res.status(400).json({ error: "Drink Exists" });
        }

        const inventoryIdResult = await pool.query(
            "SELECT COALESCE(MAX(id), 0) + 1 AS new_id FROM inventory"
        );
        const newInventoryId = inventoryIdResult.rows[0].new_id;

        const drinkIdResult = await pool.query(
            "SELECT COALESCE(MAX(id), 0) + 1 AS new_id FROM drinks"
        );
        const newDrinkId = drinkIdResult.rows[0].new_id;

        await pool.query(
            "INSERT INTO inventory (id, name, quantity, price) VALUES ($1, $2, $3, $4)",
            [newInventoryId, name, quantityInput, priceInput]
        );

        await pool.query(
            "INSERT INTO drinks (id, name, price) VALUES ($1, $2, $3)",
            [newDrinkId, name, priceInput]
        );

        await pool.query(
            "INSERT INTO drink_inventory (drinkid, inventoryid) VALUES ($1, $2)",
            [newDrinkId, newInventoryId]
        );

        await pool.query(
            "INSERT INTO categories_drink (categoryid, drinkid) VALUES ($1, $2)",
            [selectedCategoryInput, newDrinkId]
        );

        res.status(200).json({
            message: "Item added successfully",
        });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Server error occurred" });
    }
});

app.post("/addTopping", async (req, res) => {
    try {
        const { name, toppingPrice, toppingQuantity } = req.body;

        if (!name || !toppingPrice || !toppingQuantity) {
            return res.status(400).json({ error: "Missing fields" });
        }

        if (parseFloat(toppingPrice) < 0 || parseFloat(toppingQuantity) < 0) {
            return res.status(400).json({ error: "Invalid fields" });
        }

        const toppingCheck = await pool.query(
            "SELECT count(*) FROM toppings where name = ($1)",
            [name]
        );
        const nameExists = parseInt(toppingCheck.rows[0].count, 10); // convert to int

        if (nameExists > 0) {
            return res.status(400).json({ error: "Topping Exists" });
        }

        const inventoryIdResult = await pool.query(
            "SELECT COALESCE(MAX(id), 0) + 1 AS new_id FROM inventory"
        );
        const newInventoryId = inventoryIdResult.rows[0].new_id;

        const ToppingIdResult = await pool.query(
            "SELECT COALESCE(MAX(id), 0) + 1 AS new_id FROM toppings"
        );
        const newToppingId = ToppingIdResult.rows[0].new_id;

        await pool.query(
            "INSERT INTO inventory (id, name, quantity, price) VALUES ($1, $2, $3, $4)",
            [newInventoryId, name, toppingQuantity, toppingPrice]
        );

        await pool.query(
            "INSERT INTO toppings (id, name, price) VALUES ($1, $2, $3)",
            [newToppingId, name, toppingPrice]
        );

        await pool.query(
            "INSERT INTO topping_inventory (toppingid, inventoryid) VALUES ($1, $2)",
            [newToppingId, newInventoryId]
        );

        res.status(200).json({
            message: "Item added successfully",
        });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Server error occurred" });
    }
});

app.post("/addEmployee", async (req, res) => {
    try {
        const { name, shifttimings, role } = req.body;

        const employeeIdResult = await pool.query(
            "SELECT COALESCE(MAX(id), 0) + 1 AS new_id FROM employees"
        );
        const newEmployeeId = employeeIdResult.rows[0].new_id;

        await pool.query(
            "INSERT INTO employees (id, name, role, shifttimings) VALUES ($1, $2, $3, $4)",
            [newEmployeeId, name, role, shifttimings]
        );

        res.status(200).json({
            message: "Employee added successfully",
        });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Server error occurred" });
    }
});

app.post("/add-item", (req, res) => {
    const { name, quantity, price } = req.body;

    // check that all the required fields exist
    if (!name || !quantity || !price) {
        return res.status(400).json({ error: "Missing field(s)" });
    }

    // Insert the new item into the database
    //const query = 'INSERT INTO inventory (name, quantity, price) VALUES (?, ?, ?)';
    // db.execute(query, [name, quantity, price], (err, result) => {
    //   if (err) {
    //     console.error('Error inserting data: ', err);
    //     return res.status(500).json({ error: 'Failed to add item' });
    //   }

    pool.query("SELECT COUNT(*) FROM inventory", (err, results) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Failed to add item" });
        }
        //console.log("Inventory count:", results[0].inventory_count);
    });

    res.status(200).json({
        message: "Item added successfully",
        item: { id: result.insertId, name, quantity, price },
    });
});
//});

app.get("/hourly-product-usage/:date", async (req, res) => {
    try {
        const { date } = req.params;
        const query = `
            SELECT distinct name, count(name), EXTRACT(hour FROM o.timestamp) as hour 
            FROM order_drink_modifications_toppings odmt 
            JOIN drinks d ON odmt.drinkid = d.id 
            JOIN orders o ON odmt.orderid = o.id 
            WHERE o.timestamp >= $1::timestamp 
            AND o.timestamp < ($1::timestamp + interval '1 day')
            GROUP BY hour, name 
            ORDER by name, hour;
        `;
        
        const result = await pool.query(query, [date]);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching hourly product usage:", err);
        res.status(500).json({ error: "Failed to fetch hourly product usage" });
    }
});

app.get("/daily-product-popularity/:date", async (req, res) => {
    try {
        const { date } = req.params;
        const query = `
            SELECT distinct name, count(name)
            FROM order_drink_modifications_toppings odmt 
            JOIN drinks d ON odmt.drinkid = d.id 
            JOIN orders o ON odmt.orderid = o.id 
            WHERE o.timestamp >= $1::timestamp 
            AND o.timestamp < ($1::timestamp + interval '1 day')
            GROUP BY name 
            ORDER by name;
        `;
        
        const result = await pool.query(query, [date]);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching daily product usage:", err);
        res.status(500).json({ error: "Failed to fetch daily product usage" });
    }
});

app.get("/weekly-product-popularity/:date", async (req, res) => {
    try {
        const { date } = req.params;
        const query = `
            SELECT distinct name, count(name)
            FROM order_drink_modifications_toppings odmt 
            JOIN drinks d ON odmt.drinkid = d.id 
            JOIN orders o ON odmt.orderid = o.id 
            WHERE o.timestamp >= date_trunc('week', $1::timestamp)
            AND o.timestamp < (date_trunc('week', $1::timestamp) + interval '1 week')
            GROUP BY name 
            ORDER by name;
        `;
        
        const result = await pool.query(query, [date]);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching daily product usage:", err);
        res.status(500).json({ error: "Failed to fetch daily product usage" });
    }
});

app.get("/monthly-product-popularity/:date", async (req, res) => {
    try {
        const { date } = req.params;
        const query = `
            SELECT distinct name, count(name)
            FROM order_drink_modifications_toppings odmt 
            JOIN drinks d ON odmt.drinkid = d.id 
            JOIN orders o ON odmt.orderid = o.id 
            WHERE o.timestamp >= date_trunc('month', $1::timestamp)
            AND o.timestamp < (date_trunc('month', $1::timestamp) + interval '1 month')
            GROUP BY name 
            ORDER by name;
        `;
        
        const result = await pool.query(query, [date]);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching daily product usage:", err);
        res.status(500).json({ error: "Failed to fetch daily product usage" });
    }
});

app.get("/yearly-product-popularity/:date", async (req, res) => {
    try {
        const { date } = req.params;
        const query = `
            SELECT distinct name, count(name)
            FROM order_drink_modifications_toppings odmt 
            JOIN drinks d ON odmt.drinkid = d.id 
            JOIN orders o ON odmt.orderid = o.id 
            WHERE o.timestamp >= date_trunc('year', $1::timestamp)
            AND o.timestamp < (date_trunc('year', $1::timestamp) + interval '1 year')
            GROUP BY name 
            ORDER by name;
        `;
        
        const result = await pool.query(query, [date]);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching daily product usage:", err);
        res.status(500).json({ error: "Failed to fetch daily product usage" });
    }
});

app.get("/x-report/:date", async (req, res) => {
    try {
        const date = req.params.date;
        if (!date) {
            return res.status(400).json({ error: "Date parameter is required" });
        }

        const sqlCheckRun = "SELECT run FROM z_report WHERE DATE(timestamp) = $1";
        const resultCheckRun = await pool.query(sqlCheckRun, [date]);

        let runStatus = false;
        if (resultCheckRun.rows.length > 0) {
            runStatus = resultCheckRun.rows[0].run === 1;
        }

        const sqlXReport = `
            WITH unique_drinks AS (
                SELECT orderid, drinkid, MAX(d.price) AS drink_price
                FROM order_drink_modifications_toppings odmt
                JOIN drinks d ON odmt.drinkid = d.id
                GROUP BY orderid, drinkid
            ),
            topping_prices AS (
                SELECT odmt.orderid, SUM(t.price) AS total_topping_price
                FROM order_drink_modifications_toppings odmt
                JOIN toppings t ON odmt.topping_modification_id = t.id
                WHERE odmt.topping_modification_id BETWEEN 0 AND 10
                GROUP BY odmt.orderid
            )
            SELECT
                EXTRACT(hour FROM o.timestamp) AS hour_of_day,
                COUNT(DISTINCT o.id) AS num_orders,
                SUM(ud.total_drink_price + COALESCE(tp.total_topping_price, 0)) AS order_total
            FROM orders o
            LEFT JOIN (
                SELECT orderid, SUM(drink_price) AS total_drink_price
                FROM unique_drinks
                GROUP BY orderid
            ) ud ON o.id = ud.orderid
            LEFT JOIN topping_prices tp ON o.id = tp.orderid
            WHERE DATE(o.timestamp) = $1
            GROUP BY hour_of_day
            ORDER BY hour_of_day;
        `;

        const resultXReport = await pool.query(sqlXReport, [date]);
        //console.log("X-Report:", resultXReport.rows);

        const reportData = resultXReport.rows.map(row => ({
            hour: row.hour_of_day,
            totalOrders: runStatus ? 0 : row.num_orders,
            totalSales: runStatus ? 0 : row.order_total
        }));

        res.json(reportData);
    } catch (err) {
        console.error("Error generating X-Report:", err);
        res.status(500).json({ error: "Failed to generate X-Report" });
    }
});

app.get("/z-report/:date", async (req, res) => {
    try {
        const date = req.params.date;
        if (!date) {
            return res.status(400).json({ error: "Date parameter is required" });
        }

        const updatedDate = `${date} 00:00:00`;
        const timestamp = new Date(updatedDate);

        //console.log(resultCheck.rows[0].count);
        const sqlCheckRun = "SELECT COUNT(*) FROM z_report WHERE timestamp = $1 AND run = 1";
        const resultCheckRun = await pool.query(sqlCheckRun, [timestamp]);

        if (resultCheckRun.rows[0].count > 0) {
            return res.json({
                message: "Z-Report has already been run, try again tomorrow.",
                totalRevenue: 0,
                totalTax: 0,
                totalProfit: 0,
                totalDrinks: 0,
                totalOrders: 0,
                totalToppings: 0
            });
        }

        const sqlOrders = "SELECT COUNT(DISTINCT id) AS total_orders FROM orders WHERE DATE(timestamp) = $1";
        const resultOrders = await pool.query(sqlOrders, [date]);
        const totalOrders = resultOrders.rows[0].total_orders;

        const sqlDrinksRevenue = `
            WITH OrderList AS (
                SELECT id FROM orders WHERE DATE(timestamp) = $1
            ),
            UniqueDrinks AS (
                SELECT DISTINCT odmt.orderid, odmt.drinkid
                FROM order_drink_modifications_toppings odmt
                JOIN OrderList ol ON odmt.orderid = ol.id
            )
            SELECT COUNT(*) AS total_drinks,
                   SUM(d.price) AS total_drink_revenue
            FROM UniqueDrinks ud
            JOIN drinks d ON ud.drinkid = d.id;
        `;

        const resultDrinksRevenue = await pool.query(sqlDrinksRevenue, [date]);
        const totalDrinks = resultDrinksRevenue.rows[0].total_drinks;
        const totalDrinkRevenue = resultDrinksRevenue.rows[0].total_drink_revenue;

        const sqlToppings = `
            SELECT COUNT(*) AS total_toppings, SUM(t.price) AS total_topping_revenue
            FROM order_drink_modifications_toppings odmt
            JOIN toppings t ON odmt.topping_modification_id = t.id
            JOIN orders o ON odmt.orderid = o.id
            WHERE DATE(o.timestamp) = $1
            AND odmt.topping_modification_id NOT BETWEEN 11 AND 18;
        `;

        const resultToppings = await pool.query(sqlToppings, [date]);
        const totalToppings = resultToppings.rows[0].total_toppings;
        const totalToppingRevenue = resultToppings.rows[0].total_topping_revenue;

        const totalRevenue = totalDrinkRevenue + totalToppingRevenue;

        res.json({
            totalRevenue: (totalRevenue * 1.08).toFixed(2),
            totalTax: (totalRevenue * 0.08).toFixed(2),
            totalProfit: totalRevenue.toFixed(2),
            totalDrinks,
            totalOrders,
            totalToppings
        });
    } catch (err) {
        console.error("Error generating Z-Report:", err);
        res.status(500).json({ error: "Failed to generate Z-Report" });
    }
});

app.post("/checkZReport", async (req, res) => {
    try {
        const { date } = req.body;

        const updatedDate = `${date} 00:00:00`;
        const timestamp = new Date(updatedDate);

        const sqlCheck = "SELECT COUNT(*) FROM z_report WHERE timestamp = $1";
        const resultCheck = await pool.query(sqlCheck, [timestamp]);

        if (resultCheck.rows[0].count === "0") {
            res.status(200).json({
                message: "Success",
            });
        }
        else {
            const sqlCheckRun = "SELECT COUNT(*) FROM z_report WHERE DATE(timestamp) = $1";
            const resultCheckRun = await pool.query(sqlCheckRun, [date]);
            if (resultCheckRun.rows[0].count === "0") {
                res.status(200).json({
                    message: "Success",
                });
            }
            else {
                // already ran
                res.status(200).json({
                    message: "Z-Report has already been generated",
                });
            }
        }
        
    } catch (err) {
        res.status(500).json({ error: "Failed to check Z-Report" });
        console.error("Error checking Z-Report:", err);
    }
});

app.post("/updateZReport", async (req, res) => {
    try {
        const { date } = req.body;

        const updatedDate = `${date} 00:00:00`;
        const timestamp = new Date(updatedDate);

        const sqlCheck = "SELECT COUNT(*) FROM z_report WHERE timestamp = $1";
        const resultCheck = await pool.query(sqlCheck, [timestamp]);

        if (resultCheck.rows[0].count === "0") {
            const sqlUpdate = "INSERT INTO z_report VALUES ($1, 1)";
            await pool.query(sqlUpdate, [timestamp]);
            res.status(200).json({
                message: "Success",
            });
        }
        else {
            const sqlCheckRun = "SELECT COUNT(*) FROM z_report WHERE DATE(timestamp) = $1";
            const resultCheckRun = await pool.query(sqlCheckRun, [date]);
            if (resultCheckRun.rows[0].count === "0") {
                const sqlUpdate = "UPDATE z_report SET run = 1 WHERE timestamp = $1";
                await pool.query(sqlUpdate, [timestamp]);
                res.status(200).json({
                    message: "Success",
                });
            }
            else {
                // no update needed, already ran
                res.status(200).json({
                    message: "Z-Report has already been generated",
                });
            }
        }
        
    } catch (err) {
        res.status(500).json({ error: "Failed to update Z-Report" });
        console.error("Error updating Z-Report:", err);
    }
});

function formatDrinkName(str) {
    return str
        .split('-') 
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
        .join(' '); // Join with spaces
}

app.post('/newOrder', async (req, res) => {
    const { customerName, cart } = req.body;

    try {
        if (!(Array.isArray(cart) && cart.length > 0)) {
            res.status(500).json({ error: "Error fetching items in" });
        }
    
        const empid = 0;
        const timestamp = new Date().toISOString().slice(0, 19).replace("T", " "); 
        
        const newID = await pool.query(
            "SELECT COALESCE(MAX(id), 0) + 1 AS new_id FROM orders;"
        );
        const orderId = newID.rows[0].new_id;
    
        const sqlCheck = "SELECT COUNT(*) FROM customers WHERE name = $1";
        const resultCheck = await pool.query(sqlCheck, [customerName]);
    
        var custId = 0; 
        if (resultCheck.rows[0].count === "0") {
            const userID = await pool.query(
                "SELECT COALESCE(MAX(id), 0) + 1 AS new_id FROM customers;"
            );
            custId = userID.rows[0].new_id;     
        }
        else {
            const sqlQuery = "SELECT id AS new_id FROM customers where name = $1";
            const userID = await pool.query(sqlQuery, [customerName]);
            custId = userID.rows[0].new_id;   
        }

        const insertOrderSQL = `
            INSERT INTO orders (id, customerid, employeeid, timestamp)
            VALUES ($1, $2, $3, $4)
            `;
        await pool.query(insertOrderSQL, [orderId, custId, empid, timestamp]);

        for (const item of cart) {
            const {
                drinkName,
                drinkPrice,
                quantity,
                selectedIce,
                selectedSugar,
                selectedToppings = [],
                totalPrice
            } = item;

            for (let i = 0; i < quantity; i++) {
                const formattedDrinkName = formatDrinkName(drinkName);
            
                const drinkQuery = await pool.query(
                    "SELECT id FROM drinks WHERE name = $1",
                    [formattedDrinkName]
                );
                    
                const drinkId = drinkQuery.rows[0].id;

                const iceQuery = await pool.query(
                    "SELECT id FROM modifications WHERE name = $1",
                    [selectedIce]
                );
                    
                const iceId = iceQuery.rows[0].id;

                await pool.query(
                    `   INSERT INTO order_drink_modifications_toppings (orderid, drinkid, topping_modification_id)
                        VALUES ($1, $2, $3)
                    `,
                    [orderId, drinkId, iceId]
                );

                const sugarQuery = await pool.query(
                    "SELECT id FROM modifications WHERE name = $1",
                    [selectedSugar]
                );
                
                const sugarId = sugarQuery.rows[0].id;

                await pool.query(
                    `   INSERT INTO order_drink_modifications_toppings (orderid, drinkid, topping_modification_id)
                        VALUES ($1, $2, $3)
                    `,
                    [orderId, drinkId, sugarId]
                );

                for (const topping of selectedToppings) {
                    
                    const toppingQuery = await pool.query(
                        "SELECT id FROM toppings WHERE name = $1",
                        [topping.name]
                    );
                    
                    const toppingId = toppingQuery.rows[0].id;

                    const insertODMT = `
                        INSERT INTO order_drink_modifications_toppings (orderid, drinkid, topping_modification_id)
                        VALUES ($1, $2, $3)
                    `;
                    await pool.query(insertODMT, [orderId, drinkId, toppingId]);
                }
            }
        };

        res.status(200).json({ message: 'Order placed successfully', orderId });
    } catch (err) {
        console.error('Failed to place order:', err);
        res.status(500).json({ error: 'Failed to place order' });
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
