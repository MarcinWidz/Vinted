const express = require("express");
const router = express.Router();

const Offer = require("../Models/Offer");
const User = require("../Models/User");

router.get("/offers", async (req, res) => {
  let priceSort;
  let skip;
  try {
    let filters = {};
    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }
    if (req.query.priceMin) {
      filters.product_price = { $gte: req.query.priceMin };
    }
    if (req.query.priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = req.query.priceMax;
      } else {
        filters.product_price = { $lte: req.query.priceMax };
      }
    }
    if (req.query.sort) {
      if (req.query.sort === "price-asc") {
        priceSort = 1;
      } else {
        priceSort = -1;
      }
    }
    if (req.query.page) {
      for (let i = 1; i < req.query.page; i++) {
        skip += 3;
      }
    }
    console.log(filters);

    const filteredOffers = await Offer.find(filters)
      .select("product_name product_price product_description")
      .sort({ product_price: priceSort })
      .limit(3)
      .skip(skip);

    const count = await Offer.countDocuments(filters); //renvoie le nombre des documents qui matchent matchs

    res.json(filteredOffers);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
