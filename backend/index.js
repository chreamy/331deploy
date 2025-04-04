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
        console.log(drinks);
        res.send({ drinks: data });
    });
});

app.get("/stock", (req, res) => {
    stock = [];
    pool.query("SELECT name, quantity FROM inventory order by quantity asc;").then((query_res) => {
        for (let i = 0; i < query_res.rowCount; i++) {
            stock.push(query_res.rows[i]);
        };
        res.send({ stock });
    });
});

app.get("/inventory", (req, res) => {
    inventory = [];
    pool.query("SELECT name, price, drinkid, inventoryid FROM inventory join drink_inventory on inventory.id = drink_inventory.drinkid;;").then((query_res) => {
        for (let i = 0; i < query_res.rowCount; i++) {
            inventory.push(query_res.rows[i]);
        };
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

        const groupedModifications = Object.entries(modMap).map(([type, options]) => ({
            type,
            options,
        }));

        res.json({
            toppings: toppingsResult.rows,
            modifications: groupedModifications,
        });
    } catch (err) {
        console.error("Error fetching drink options:", err);
        res.status(500).json({ error: "Failed to fetch drink options" });
    }
});




app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
