const express = require("express");
const router = express.Router();
const Cart = require("../models/cart");
const Product = require("../models/product");
const auth = require("../middleware/auth");

// adding an item to card

router.post("/add", auth, async (req, res) => {
  const { produdctID, quanity } = req.body;
  if (!produdctID || !quanity) {
    return res.status(400).send("empty input fields");
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const product = await Product.findById(produdctID);
  if (!product) {
    return res.status(404).json({ error: "product not found " });
  }

  const doesExist = cart.items.find((item) => item.product.equals(produdctID));
  if (doesExist) {
    doesExist.quantity += quanity;
  } else {
    cart.items.push({ product: produdctID, quantity });
  }

  await cart.save();

  return res.json(cart);
});
// remove an item from cart
router.post("/remove", auth, async (req, res) => {
  const { produdctID } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ error: " cannot find cart" });
  }

  cart.items = cart.items.filter((prod) => !prod.product.equals(produdctID));
  await cart.save();
  return res.json(cart);
});
// get cart
router.get("/", auth, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product"
  );
  res.json(cart || { items: [] });
});

module.exports = router;
