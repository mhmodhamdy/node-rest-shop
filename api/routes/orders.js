
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const { Order, validate} = require('../models/order'); 
const { Product } = require('../models/product');
const express = require('express');
const router  = express.Router();

router.get('/', [auth, admin], async (req, res)=>{
  const orders = await Order
    .find()
    .sort('product.price')
    .select('quantity product');
  res.status(200).json({
    count: orders.length,
    orders: orders.map(orders =>{
      return{
        _id: orders._id,
        product: orders.product,
        quantity: orders.quantity,
        request: {
          type: 'GET',
          url: 'http://localhost:3000/api/orders/' + orders._id
        }
      }
    }),

  })
});

router.post('/', async (req, res)=>{
  const { error } = validate(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  const product = await Product.findById(req.body.productId);
  if(!product) return res.status(400).send('Invalid product');

  let order = new Order({
    product: {
      _id: product._id,
      name: product.name,
      price: product.price
    },
    quantity: req.body.quantity
  });
  await order.save();
  res.send(order);
});

router.get('/:id', [auth, admin], async (req, res)=>{
  const order = await Order.findById(req.params.id);
  if(!order) return res.status(404).send('The order with the givin id was not found');
  res.status(200).json({
    order: order,
    request: {
      type: 'POST',
      url: 'http://localhost:3000/api/orders',
      body: { productId: "ID", quantity: "Number" }
    }
  })
});


router.delete('/:id', [auth, admin], async (req, res)=>{
  const order =  await Order.findByIdAndRemove(req.params.id);
  if(!order) return res.status(404).send('The order with the givin id was not found');
  res.status(200).json({
    message: "order deleted",
    order: order,
    request: {
      type: 'POST',
      url: 'http://localhost:3000/api/orders',
      body: {
        productId: "id", 
        quantity: "number"
      }
    }
  })
});


module.exports = router;