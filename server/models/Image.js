const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ImageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image_by: {
    type: String,
    required: true,
  },
  is_private: {
    type: String,
    required: true,
  },
  img_url: {
    type: String,
    required: true,
  },
  resetToken: String,
});

module.exports = Image = mongoose.model("image", ImageSchema);
