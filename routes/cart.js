/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable comma-dangle */
const express = require("express");

const router = express.Router();
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const verifyToken = require("../middleware/verifyToken");

const checkQuantity = (quantity, availableQuantity) =>
  quantity > availableQuantity || quantity === 0;

router.get("/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;
  try {
    const cart = await Cart.findOne({ userId }).populate("products.productId");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    return res.json(cart);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", errorMessage: error });
  }
});

router.post("/:userId/add-products", verifyToken, async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    const product = await Product.findById(productId);
    if (!cart) {
      // Cart not found, create a new cart for the user
      if (checkQuantity(quantity, product.availableQuantity)) {
        res.status(201).json({ message: "Not a Valid Quantity" });
      } else {
        const newCart = new Cart({
          userId,
          products: [{ productId, quantity }],
        });
        const savedCart = await newCart.save();
        res.status(201).json(savedCart);
      }
    } else if (checkQuantity(quantity, product.availableQuantity)) {
      res.status(201).json({ message: "Not a Valid Quantity" });
    } else {
      const existingProduct = cart.products.find(
        (cartProduct) => cartProduct.productId.toString() === productId
      );
      // Product already exists in the cart, update the quantity
      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart.products.push({ productId, quantity });
      }
      // Update the available quantity of the product
      product.availableQuantity -= quantity;
      const updatedCart = await cart.save();
      const updatedProduct = await product.save();
      // res.json(updatedCart);
      res.json({ updatedCart, updatedProduct });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", errorMessage: error });
  }
});

router.delete("/:userId/delete-products", verifyToken, async (req, res) => {
  const { userId } = req.params;
  const { productId } = req.body;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const productIndex = cart.products.findIndex(
      (product) => product.productId.toString() === productId
    );
    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }
    // Remove the product from the cart
    cart.products.splice(productIndex, 1);
    await cart.save();
    return res.json(cart);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", errorMessage: error });
  }
});

router.put("/:userId/update-products", verifyToken, async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const product = cart.products.find(
      (item) => item.productId.toString() === productId
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found in cart" });
    }
    // Update the quantity of the product
    product.quantity = quantity;
    await cart.save();
    return res.json(cart);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", errorMessage: error });
  }
});

module.exports = router;
