const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator/check");

const Image = require("../../models/Image");
const User = require("../../models/User");

const nodemailer = require("nodemailer");
const config = require("config");
const userMail = config.get("emailUser");
const userPassword = config.get("password");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: userMail,
    pass: userPassword,
  },
});

//@route    POST api/image
//@desc     Upload image details
//@access    Private
router.post(
  "/",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("description", "Description is required").not().isEmpty(),
      check("is_private", "Public or Private is required").not().isEmpty(),
      check("img_url", "Image url is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      //getting user from db without password
      const user = await User.findById(req.user.id).select("-password");

      const newImage = new Image({
        title: req.body.title,
        description:req.body.description,
        image_by:user.name,
        is_private:req.body.is_private,
        img_url:req.body.img_url
      });
      const image = await newImage.save();

      res.json(image);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route    GET api/image
//@desc     Get all public images
//@access    Private
router.get("/allImages", auth, async (req, res) => {
  try {
    
    const image = await Image.find({ "is_private": "Public"})
    res.json(image);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route    GET api/image
//@desc     Get own images
//@access    Private
router.get("/own_images", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const image = await Image.find().where("image_by").equals(user.name);

    res.json(image);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


//@route    PUT api/image/updateimage/:id
//@description  update images
//@access   Private

router.put(
  "/updateimage/:id",
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id);

        const updates = {
        title: req.body.title,
        description:req.body.description,
        image_by:user.name,
        is_private:req.body.is_private,
        img_url:req.body.img_url
      };

      const image = await Image.findOneAndUpdate(
        { _id: req.params.id },
        updates,
        {
          new: true,
        }
      ).where("image_by").equals(user.name);

      await image.save();
      res.json(image);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
); 

//@route    DELETE api/image/deleteimage/:id
//@description  delete images 
//@access   Private

router.delete("/deleteimage/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    
    const image = await Image.findByIdAndRemove(req.params.id).where("image_by").equals(user.name);
    if(image === null){
    res.send("This user is not authorised to deleted this image")
    }else{
      res.send("Image deleted Successsfully")
    }

  } catch (err) {
    console.error(err.response);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Image not Found" });
    }
    return res.status(500).send("Server Error");
  }
});

module.exports = router;
