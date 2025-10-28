const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const Cart = require("../models/cart");
const Product = require("../models/product");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");
const applyDiscount = require("../utils/discount");
const product = require("../models/product");

function notifyUser(userID, msg) {
  console.log(`${userID} : ${msg}`);
}

// checkout

router.post("/checkout", auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );
    if (!cart || cart.items.length === 0) {
      throw new Error("cart is already empty");
    }

    let total = 0;
    for (let item of cart.items) {
      const availaible = item.product.stock - item.product.reserved;
      if (availaible < item.quantity) {
        throw new Error(`${item.product.name} is out of stock`);
      }
      total = total + item.product.price * item.quantity;
    }

    const { total: finalTotal, discount } = applyDiscount(
      total,
      req.body.discount
    );

    for (let item of cart.items) {
      item.product.reserved += item.quantity;
      await item.product.save({ session });
    }

    const order = new Order({
      user: req.user._id,
      items: cart.items.map((it) => ({
        product: it.product._id,
        quantity: it.quantity,
        price: it.product.price,
      })),
      total: finalTotal,
      discountApplied: discount,
    });

    await order.save({ session });

    cart.items = [];
    await cart.save({ session });
    await session.commitTransaction();
    session.endSession();

    notifyUser(req.user._id, `order:${order._id} created (pending)`);

    res.json({ message: "order placed ", order });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: error.message });
  }
});

// verify those
router.post("/:orderId/ship", auth, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.status !== "paid")
    return res.status(400).json({ error: "Must pay first" });

  order.status = "shipped";
  await order.save();
  notify(order.user, `Order ${order._id} shipped`);
  res.json(order);
});

router.post("/:orderId/deliver", auth, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.status !== "shipped")
    return res.status(400).json({ error: "Must ship first" });

  order.status = "delivered";
  await order.save();
  notify(order.user, `Order ${order._id} delivered`);
  res.json(order);
});

module.exports = router;
