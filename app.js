const express = require("express");
const pool = require("./config/db");
const helloRoutes = require("./routes/hello");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/", helloRoutes);

const PORT = process.env.PORT || 3000;

pool.connect((err) => {
  if (err) {
    console.error("Failed to connect to the database:", err);
    process.exit(1);
  } else {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }
});
