const express = require("express");
const router = express.Router();
const Cart = require("../models/cart");
const Product = require("../models/product");
const auth = require("../middleware/auth");

// adding a product to cart
// check if the cart already exist
// for the current user
// if it doesnt exist create new cart for that user
// with an empty list of products
// so here you notice the use of [req.user._id] (payload returned after auth jwt)
// in the future we will store that JWT in the session
// look for the porduct by It's ID from the Product collection
// check if the that product exist in the cart
// if he does exist we just increment by the quantity from the req.body {productID: "13233",quantity: 3}
// else we push the whole new product in the items list of the cart

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
// based on the productID
// look the cart of the user of he already had a cart
// else we return an error cocde : in remove operation
// user must have a cart
// or the operation will be canceled
// if he already have a cart
// we look for the list of items in the cart ( array of products)
// filter them by the porductID (remove ops)
// than save the updated cart
// TODO : ill change the syntax of removing a certaint product from the item list

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

// get the user specific cart
// each cart is associated with a user id
// the id is the form the object document in the database
// so i think we avoid any leak of info
// or access to via evil requests
// also its protect route by auth

router.get("/mycart", auth, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product"
  );
  res.json(cart || { items: [] });
});

module.exports = router;
