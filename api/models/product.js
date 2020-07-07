
const Joi = require('joi')
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255
  },
  price:{
    type: Number,
    required: true,
  } 
})

const Product = mongoose.model('product', productSchema);

function validateProduct(product){
  const schema = {
    name: Joi.string().min(3).max(255).required(),
    price: Joi.number().required()
  };

  return Joi.validate(product, schema)
}

exports.productSchema = productSchema;
exports.Product = Product;
exports.validate= validateProduct;