
const admin = require('../middleware/admin');
const auth = require('../middleware/auth')
const multer = require('multer');
const express = require('express');
const router  = express.Router();
const { Product, validate } = require('../models/product');

const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './uploads/')
  },
  filename: function(req, file, cb){
    cb(null, new Date().toISOString + file.originalname)
  }
});

const upload = multer({ storage: storage });


router.get('/', async (req, res)=>{
  const products = await Product.find()
  .select('name price')
  .sort('name');
  res.send(products);
});

router.get('/:id', async (req, res)=>{
  const product =  await Product
    .findById(req.params.id)
    .select('name price');
  if(!product) return res.status(404).send('The product with the given id was not found');

  res.status(200).json({
    message: "Product found",
    product: product,
    request: {
      type: 'GET',
      url: 'http://localhost:3000/api/products'
    }
    });
});

router.post('/', [auth, admin ], upload.single('productImage') , async (req, res)=>{
  const { error } = validate(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  });
  await product.save();
  res.send(product)
});


router.put('/:id', [auth, admin], async (req, res)=>{
  const product = await Product.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    price: req.body.price
  }, {new: true});
  if(!product) return res.status(404).send('the product with the given id was not found');
  res.status(200).json({
    message:'product updated',
    request: {
      type: 'GET',
      url: 'http://localhost:3000/api/products'+ req.params.id
    }
  });  
});

router.delete('/:id',[ auth, admin], async (req, res)=>{
  const product = await Product.findByIdAndRemove(req.params.id);
  if(!product) return res.status(404).send('The product with the given id was not found');
  res.status(200).json({
    message: "product deleted",
    request: {
      type: "POST",
      url: "http://localhost:3000/api/products",
      body: { name: 'String', price: 'Number'}
    }
  })
});


module.exports = router;