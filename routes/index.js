var express = require('express');
var router = express.Router();
const User = require("../models/user");
const CrudFactory = require('../controllers/CrudFactory');
const { body } = require('express-validator');
const {setUserRoutes} = require('../controllers/userController');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('home', { title: 'Express' });
});

setUserRoutes(router);

module.exports = router;
