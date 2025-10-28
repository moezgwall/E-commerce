const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
require("dotenv").config();
const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 3000;
const dburl = process.env.DB_URL;
mongoose
  .connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"));

app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

app.get("/", (req, res) => {
  return res.send("hello world");
});

app.listen(port, () => console.log("Server running at http://localhost:3000"));
