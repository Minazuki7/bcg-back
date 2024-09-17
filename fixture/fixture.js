const fs = require("fs");
const path = require("path");
const pool = require("../config/db"); // Make sure this points to your DB configuration

// Load data from the JSON file
const dataPath = path.join(__dirname, "Insurance-Data.json");
const policies = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

// Create the table if it doesn't exist
const createTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS policies (
      policy_id BIGINT PRIMARY KEY,
      date_of_purchase DATE,
      customer_id BIGINT,
      fuel VARCHAR(50),
      vehicle_segment VARCHAR(10),
      premium NUMERIC,
      bodily_injury_liability BOOLEAN,
      personal_injury_protection BOOLEAN,
      property_damage_liability BOOLEAN,
      collision BOOLEAN,
      comprehensive BOOLEAN,
      customer_gender VARCHAR(10),
      customer_income_group VARCHAR(50),
      customer_region VARCHAR(50),
      customer_marital_status BOOLEAN
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log("Table created or already exists.");
  } catch (error) {
    console.error("Error creating table:", error);
  }
};

// Insert data into the table from JSON
const insertData = async () => {
  try {
    for (const policy of policies) {
      const query = `
        INSERT INTO policies (
          policy_id, date_of_purchase, customer_id, fuel, vehicle_segment, 
          premium, bodily_injury_liability, personal_injury_protection, 
          property_damage_liability, collision, comprehensive, 
          customer_gender, customer_income_group, customer_region, 
          customer_marital_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `;

      const values = [
        policy.Policy_id,
        new Date(policy["Date of Purchase"]),
        policy.Customer_id,
        policy.Fuel,
        policy.VEHICLE_SEGMENT,
        policy.Premium,
        policy["bodily injury liability"] === 1,
        policy["personal injury protection"] === 1,
        policy["property damage liability"] === 1,
        policy.collision === 1,
        policy.comprehensive === 1,
        policy.Customer_Gender,
        policy["Customer_Income group"],
        policy.Customer_Region,
        policy.Customer_Marital_status === 1,
      ];

      await pool.query(query, values);
    }
    console.log("Data inserted successfully!");
  } catch (error) {
    console.error("Error inserting data:", error);
  } finally {
    pool.end(); // Close the database connection
  }
};

// Run the table creation and data insertion
const run = async () => {
  await createTable();
  await insertData();
};

run();
