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
    pool.query("SELECT name, quantity FROM inventory order by quantity asc;").then((query_res) => {
        for (let i = 0; i < query_res.rowCount; i++) {
            stock.push(query_res.rows[i]);
        };
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

app.get("/inventory", (req, res) => {
    inventory = [];
    pool.query("SELECT i.name AS drink_name, i.price, di.drinkid, di.inventoryid, c.categoryid, c.categoryname FROM inventory AS i INNER JOIN drink_inventory AS di ON i.id = di.inventoryid INNER JOIN (SELECT ca.name AS categoryname, cd.categoryid, cd.drinkid FROM categories AS ca JOIN categories_drink AS cd ON ca.id = cd.categoryid) AS c ON di.drinkid = c.drinkid;")
        .then((drinkQueryRes) => {
            drinkQueryRes.rows.forEach(row => {
                inventory.push({
                    name: row.drink_name,
                    price: row.price,
                    drinkid: row.drinkid,
                    toppingid: null,
                    inventoryid: row.inventoryid,
                    categoryid: row.categoryid,
                    categoryname: row.categoryname
                });
            });

    return pool.query("SELECT name, price, toppingid, inventoryid FROM inventory INNER JOIN topping_inventory ON inventory.id = topping_inventory.inventoryid;");
        })
        .then((toppingQueryRes) => {
            toppingQueryRes.rows.forEach(row => {
                inventory.push({
                    name: row.name,
                    price: row.price,
                    drinkid: null, 
                    toppingid: row.toppingid,
                    inventoryid: row.inventoryid,
                    categoryid: null,
                    categoryname: null
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

app.delete("/removeDrink", async (req, res) => {
    try {
        const { name, drinkid } = req.body;

        await pool.query('DELETE FROM drink_inventory where drinkid = ($1)', [drinkid]);
        
        await pool.query('DELETE FROM categories_drink where drinkid = ($1)', [drinkid]);
        
        await pool.query('DELETE FROM inventory where name = ($1)', [name]);

        await pool.query('DELETE FROM drinks where name = ($1)', [name]);
        
        res.status(200).json({
            message: 'Item successfully deleted',
        });
    }
    catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Server error occurred' });
    }
})

app.delete("/removeTopping", async (req, res) => {
    try {
        const { name, toppingid } = req.body;

        await pool.query('DELETE FROM topping_inventory WHERE toppingid = ($1)', [toppingid]);

        await pool.query('DELETE FROM toppings WHERE id = ($1)', [toppingid]);
        
        await pool.query('DELETE FROM inventory where name = ($1)', [name]);
    
        res.status(200).json({
            message: 'Item successfully deleted',
        });
    }
    catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Server error occurred' });
    }
})

app.post('/addInventory', async (req, res) => {
    try {
        const { drinkNameInput, quantityInput, priceInput, selectedCategoryInput } = req.body;
  
        if (!drinkNameInput || !quantityInput || !priceInput || !selectedCategoryInput) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        if (parseFloat(priceInput) < 0 || parseFloat(quantityInput) < 0) {
            return res.status(400).json({ error: 'Invalid fields' });
        }

        const drinkCheck = await pool.query('SELECT count(*) FROM drinks where name = ($1)',
        [drinkNameInput]);
        const nameExists = parseInt(drinkCheck.rows[0].count, 10); // convert to int

        if (nameExists > 0) {
            return res.status(400).json({ error: 'Drink Exists' });
        }

        const inventoryIdResult = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 AS new_id FROM inventory');
        const newInventoryId = inventoryIdResult.rows[0].new_id;

        const drinkIdResult = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 AS new_id FROM drinks');
        const newDrinkId = drinkIdResult.rows[0].new_id;

        await pool.query('INSERT INTO inventory (id, name, quantity, price) VALUES ($1, $2, $3, $4)',
            [newInventoryId, drinkNameInput, quantityInput, priceInput]
        );
  
        await pool.query('INSERT INTO drinks (id, name, price) VALUES ($1, $2, $3)',
            [newDrinkId, drinkNameInput, priceInput]
        );

        await pool.query('INSERT INTO drink_inventory (drinkid, inventoryid) VALUES ($1, $2)',
            [newDrinkId, newInventoryId]
        );

        await pool.query('INSERT INTO categories_drink (categoryid, drinkid) VALUES ($1, $2)',
            [selectedCategoryInput, newDrinkId]
        );
        
        res.status(200).json({
            message: 'Item added successfully',
        });

        } catch (err) {
            console.error('Server error:', err);
            res.status(500).json({ error: 'Server error occurred' });
        }
    }); 

    app.post('/addTopping', async (req, res) => {
        try {
            const { toppingName, toppingPrice, toppingQuantity, } = req.body;
      
            if (!toppingName || !toppingPrice || !toppingQuantity) {
                return res.status(400).json({ error: 'Missing fields' });
            }

            if (parseFloat(toppingPrice) < 0 || parseFloat(toppingQuantity) < 0) {
                return res.status(400).json({ error: 'Invalid fields' });
            }
    
            const toppingCheck = await pool.query('SELECT count(*) FROM toppings where name = ($1)',
            [toppingName]);
            const nameExists = parseInt(toppingCheck.rows[0].count, 10); // convert to int
    
            if (nameExists > 0) {
                return res.status(400).json({ error: 'Topping Exists' });
            }
    
            const inventoryIdResult = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 AS new_id FROM inventory');
            const newInventoryId = inventoryIdResult.rows[0].new_id;
    
            const ToppingIdResult = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 AS new_id FROM toppings');
            const newToppingId = ToppingIdResult.rows[0].new_id;
    
            await pool.query('INSERT INTO inventory (id, name, quantity, price) VALUES ($1, $2, $3, $4)',
                [newInventoryId, toppingName, toppingQuantity, toppingPrice]
            );
      
            await pool.query('INSERT INTO toppings (id, name, price) VALUES ($1, $2, $3)',
                [newToppingId, toppingName, toppingPrice]
            );
    
            await pool.query('INSERT INTO topping_inventory (toppingid, inventoryid) VALUES ($1, $2)',
                [newToppingId, newInventoryId]
            );
    
            res.status(200).json({
                message: 'Item added successfully',
            });
    
            } catch (err) {
                console.error('Server error:', err);
                res.status(500).json({ error: 'Server error occurred' });
            }
        }); 

app.post('/add-item', (req, res) => {
    const { name, quantity, price } = req.body;
  
    // check that all the required fields exist
    if (!name || !quantity || !price) {
      return res.status(400).json({ error: 'Missing field(s)' });
    }
  
    // Insert the new item into the database
    //const query = 'INSERT INTO inventory (name, quantity, price) VALUES (?, ?, ?)';
    // db.execute(query, [name, quantity, price], (err, result) => {
    //   if (err) {
    //     console.error('Error inserting data: ', err);
    //     return res.status(500).json({ error: 'Failed to add item' });
    //   }
  
    pool.query('SELECT COUNT(*) FROM inventory', (err, results) => {
        if (err) {
          console.error('Error executing query:', err);
          return res.status(500).json({ error: 'Failed to add item' });
        }
        console.log('Inventory count:', results[0].inventory_count);
      });

      res.status(200).json({
        message: 'Item added successfully',
        item: { id: result.insertId, name, quantity, price }
      });
    });
  //});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});