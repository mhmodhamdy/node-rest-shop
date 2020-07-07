
const config = require('config');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const Joi = require('joi');
const express = require('express');
const bcrypt = require('bcrypt');
const router  = express.Router();
const { User, validate } = require('../models/user');

router.post('/', async (req, res)=>{
  const { error } = validate(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if(user) return res.status(400).send('User already regitered');

  user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    isAdmin: req.body.isAdmin
  })

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(user, ['id', 'name', 'email']));

});

router.post('/auth', async (req, res)=>{
  const { error } = validateAuth(req.body);
  if( error ) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });
  if(!user) return res.status(400).send('Invalied email');

  const validpassword = await bcrypt.compare(req.body.password, user.password);
  if(!validpassword) return res.status(400).send('Invalied password');

  const token = user.generateAuthToken();
  res.send(token);

});

function validateAuth(req){
  const schema = {
    email: Joi.string().required().email(),
    password: Joi.string().required()
  }
  return Joi.validate( req, schema );
}

module.exports = router;