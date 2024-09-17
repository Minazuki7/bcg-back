const express = require("express");
const {
  getPolicy,
  getPolicyById,
  insertPolicy,
  updatePolicy,
  deletePolicy,
  hello,
} = require("../controllers/hello");

router = express.Router();

router.get("/", hello);

router.get("/policy", getPolicy);

router.get("/policy/:id", getPolicyById);

router.post("/policy", insertPolicy);

router.put("/policy/:id", updatePolicy);

router.delete("/policy/:id", deletePolicy);

module.exports = router;
