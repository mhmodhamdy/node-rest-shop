
const config = require('config')
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const products = require('./api/routes/products');
const orders = require('./api/routes/orders');
const users = require('./api/routes/users');
const app = express();

if(!config.get('jwtPrivateKey')){
  console.error('FATAL ERROR: jwtPrivateKey is not defiened.');
  process.exit(1);
}

mongoose.connect('mongodb://localhost/node-rest-shop',{
  // useMongoClient: true,
  useNewUrlParser: true,
  useNewUrlParser: true,
  useUnifiedTopology:true,
  useCreateIndex: true
})
  .then(console.log('Connected to MongoDB... '))
mongoose.Promise = global.Promise;

app.use(express.json());
app.use(morgan('dev'));
app.use(express.static('uploads'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next)=>{
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Contact-Type, Accept, Authorization"
  );
  if(req.method === 'OPTIONS'){
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
})

app.use('/api/products', products);
app.use('/api/orders', orders);
app.use('/api/users', users);

app.use((req, res, next)=>{
  const error = new Error('Not found');
  res.status(404);
  next(error);
});

app.use((error, req, res, next)=>{
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;