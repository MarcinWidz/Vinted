const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "CLOUD",
  api_key: "KEY",
  api_secret: "API",
});

const Offer = require("../Models/Offer");
const User = require("../Models/User");
const isAuthenticated = require("../Middlewares/isAuthenticated");

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    const offer = new Offer({
      product_name: req.fields.name,
      product_description: req.fields.description,
      product_price: req.fields.price,
      product_details: [
        {
          condition: req.fields.condition,
        },
        {
          city: req.fields.city,
        },
        {
          brand: req.fields.brand,
        },
      ],
      owner: req.user,
    });
    const result = await cloudinary.uploader.upload(req.files.picture.path, {
      folder: `/vinted/offers/${offer._id}`,
    });

    offer.product_image = result;

    await offer.save();

    res.json(offer);
  } catch (error) {
    res.json(error.message);
  }
});

router.put("/offer/update", isAuthenticated, async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.query.id, {
      product_name: req.fields.name,
      product_description: req.fields.description,
      product_price: req.fields.price,
      product_details: [
        {
          condition: req.fields.condition,
        },
        {
          city: req.fields.city,
        },
        {
          brand: req.fields.brand,
        },
      ],
      owner: req.user,
    });
    const deleteImage = await cloudinary.uploader.destroy(
      `${offer.product_image.public_id}`
    );
    const addedImage = await cloudinary.uploader.upload(
      req.files.picture.path,
      {
        folder: `/vinted/offers/${offer._id}`,
      }
    );

    offer.product_image = addedImage;

    res.json("Updated Succesfully");
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.delete("/offer/delete", isAuthenticated, async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.query.id);
    const public_id = offer.product_image.public_id;
    await cloudinary.api.delete_resources([public_id]);
    await cloudinary.api.delete_folder(`/vinted/offers/${offer._id}`);
    res.json("Deleted Succesfully");
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    let result = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account",
    });
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json(error.message);
  }
});

module.exports = router;