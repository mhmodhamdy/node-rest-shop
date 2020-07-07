
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require ('mongoose');
const productSchema = require('./product');

const orderSchema = new mongoose.Schema({
  product:{
    type: new mongoose.Schema({
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
    }),
    required: true
  },
  quantity:{
    type: String,
    default: 1
  }
});

const Order = mongoose.model('Order', orderSchema);

function validateOrder(order){
  const schema = {
    productId: Joi.objectId().required(),
    quantity: Joi.number()
  }
  return Joi.validate(order, schema)
}

exports.Order = Order;
exports.validate = validateOrder;