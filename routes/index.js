var express = require('express');
var router = express.Router();
const User = require("../models/user");
const CrudFactory = require('../controllers/CrudFactory');
const { body } = require('express-validator');
const { setUserRoutes } = require('../controllers/userController');
const userController = require('../controllers/userController');
const hashPassword = require('../util/hashPassword');
const Message = require('../models/message');
const { setMessageRoutes } = require('../controllers/messageController');

/* GET home page. */
router.get('/', function (req, res, next) {
    Message.find({}).populate('author').exec().then((messages) => {
        res.render('home', { title: 'Express', user: req.user, messages: messages });
    })
});

setUserRoutes(router);
setMessageRoutes(router);

// Authentification routes

router.get('/log-in', userController.logInGet);
router.post('/log-in', hashPassword);
router.post('/log-in', userController.logInPost);

router.get('/log-out', userController.logOutPost);

router.get('/become-admin', userController.becomeAdminGet);

router.post('/become-admin', userController.becomeAdminPost);

router.get('/become-member', userController.becomeMemberGet);

router.post('/become-member', userController.becomeMemberPost);



module.exports = router;
