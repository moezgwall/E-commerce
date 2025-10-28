const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const auth = require("../middleware/auth");

// adding a product

router.post("/", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden access" });
  }
  const { name, price, stock } = req.body; // user inputs
  if (!name || !price || !stock) {
    return res.status(401).json({ error: "empty input field" });
  }
  const product = new Product({ name, price, stock });
  const savingProd = await product.save();
  if (!savingProd) {
    return res.status(401).json({ error: " failed to save new product" });
  }

  return res.status(200).json({ message: " product created", product });
});

// get all the products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    return res.json(products);
  } catch (error) {
    console.error("error: ", error.message);
    return res.status(500).send("internal server error");
  }
});

// get a single product
router.get("/:name", async (req, res) => {
  const prodName = req.params.name;

  const prod = await Product.findOne({ name: prodName });
  if (!prod) {
    return res.status(404).json({ error: "product not found" });
  }
  return res.json({ message: "product:", data: prod });
});

// todo : query + paggination
module.exports = router;
