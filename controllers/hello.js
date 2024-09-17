const pool = require("../config/db");

const hello = (req, res) => {
  res.send("Hello Candidate, Good luck for this round");
};

const getPolicy = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    region,
    segment,
    fuel,
    policy_id,
    customer_id,
    premium,
    bodily_injury_liability,
    personal_injury_protection,
    property_damage_liability,
    collision,
    comprehensive,
    customer_gender,
    customer_income_group,
    customer_marital_status,
  } = req.query; // Extract pagination and filters from query parameters

  const offset = (page - 1) * limit; // Calculate the offset for pagination
  let filterQuery = [];
  let filterValues = [];

  // List of filters for dynamic query building
  const filters = [
    { field: "customer_region", value: region },
    { field: "vehicle_segment", value: segment },
    { field: "fuel", value: fuel },
    { field: "policy_id", value: policy_id },
    { field: "customer_id", value: customer_id },
    { field: "premium", value: premium },
    { field: "bodily_injury_liability", value: bodily_injury_liability },
    { field: "personal_injury_protection", value: personal_injury_protection },
    { field: "property_damage_liability", value: property_damage_liability },
    { field: "collision", value: collision },
    { field: "comprehensive", value: comprehensive },
    { field: "customer_gender", value: customer_gender },
    { field: "customer_income_group", value: customer_income_group },
    { field: "customer_marital_status", value: customer_marital_status },
  ];

  // Dynamically build filter conditions
  filters.forEach((filter) => {
    if (filter.value !== undefined) {
      filterQuery.push(`${filter.field} = $${filterValues.length + 1}`);
      filterValues.push(filter.value);
    }
  });

  const whereClause =
    filterQuery.length > 0 ? `WHERE ${filterQuery.join(" AND ")}` : "";

  // SQL Query with pagination and optional filters
  const query = `
        SELECT * FROM policies
        ${whereClause}
        ORDER BY policy_id
        LIMIT $${filterValues.length + 1} OFFSET $${filterValues.length + 2};
      `;

  try {
    // Add limit and offset to the values array
    filterValues.push(limit);
    filterValues.push(offset);

    // Execute the query
    const result = await pool.query(query, filterValues);

    // Get the total count of items for pagination metadata
    const countQuery = `SELECT COUNT(*) FROM policies ${whereClause}`;
    const countResult = await pool.query(
      countQuery,
      filterValues.slice(0, filterValues.length - 2)
    ); // Same filters, no limit/offset

    res.status(200).json({
      totalItems: countResult.rows[0].count,
      totalPages: Math.ceil(countResult.rows[0].count / limit),
      currentPage: page,
      data: result.rows,
    });
  } catch (err) {
    console.error("Error fetching data", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getPolicyById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Policy ID is required" });
  }

  const query = `
      SELECT * FROM policies
      WHERE policy_id = $1
    `;

  try {
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Policy not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching policy", err);
    res.status(500).json({ error: "Server error" });
  }
};

const insertPolicy = async (req, res) => {
  const {
    policy_id,
    date_of_purchase,
    customer_id,
    fuel,
    vehicle_segment,
    premium,
    bodily_injury_liability,
    personal_injury_protection,
    property_damage_liability,
    collision,
    comprehensive,
    customer_gender,
    customer_income_group,
    customer_region,
    customer_marital_status,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO policies (
        policy_id, date_of_purchase, customer_id, fuel, vehicle_segment,
        premium, bodily_injury_liability, personal_injury_protection,
        property_damage_liability, collision, comprehensive,
        customer_gender, customer_income_group, customer_region,
        customer_marital_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        policy_id,
        date_of_purchase,
        customer_id,
        fuel,
        vehicle_segment,
        premium,
        bodily_injury_liability,
        personal_injury_protection,
        property_damage_liability,
        collision,
        comprehensive,
        customer_gender,
        customer_income_group,
        customer_region,
        customer_marital_status,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting data", err);
    res.status(500).json({ error: "Server error" });
  }
};

const updatePolicy = async (req, res) => {
  const { policy_id } = req.params;
  const {
    date_of_purchase,
    customer_id,
    fuel,
    vehicle_segment,
    premium,
    bodily_injury_liability,
    personal_injury_protection,
    property_damage_liability,
    collision,
    comprehensive,
    customer_gender,
    customer_income_group,
    customer_region,
    customer_marital_status,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE policies SET
        date_of_purchase = $1,
        customer_id = $2,
        fuel = $3,
        vehicle_segment = $4,
        premium = $5,
        bodily_injury_liability = $6,
        personal_injury_protection = $7,
        property_damage_liability = $8,
        collision = $9,
        comprehensive = $10,
        customer_gender = $11,
        customer_income_group = $12,
        customer_region = $13,
        customer_marital_status = $14
      WHERE policy_id = $15
      RETURNING *`,
      [
        date_of_purchase,
        customer_id,
        fuel,
        vehicle_segment,
        premium,
        bodily_injury_liability,
        personal_injury_protection,
        property_damage_liability,
        collision,
        comprehensive,
        customer_gender,
        customer_income_group,
        customer_region,
        customer_marital_status,
        policy_id,
      ]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error updating data", err);
    res.status(500).json({ error: "Server error" });
  }
};

const deletePolicy = async (req, res) => {
  const { policy_id } = req.params;
  try {
    await pool.query("DELETE FROM policies WHERE policy_id = $1", [policy_id]);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting data", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  hello,
  getPolicy,
  insertPolicy,
  updatePolicy,
  deletePolicy,
  getPolicyById,
};
