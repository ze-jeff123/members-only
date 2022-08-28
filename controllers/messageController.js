
const CrudFactory = require('./CrudFactory');
const Message = require("../models/message");
const { body } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const hashPassword = require('../util/hashPassword');
const { default: mongoose } = require('mongoose');

module.exports.setMessageRoutes = function (router) {
    const messageCrudFactory = CrudFactory(router, '/message', Message, (req) => {
        return {
            title: req.body.title,
            text: req.body.text,
            timestamp: new Date(),
            author: mongoose.Types.OjectId(req.params.user_id)
        }
    });

    messageCrudFactory.setValidation([
        body('firstName', "first name required").trim().isLength({ min: 1 }).escape(),
        body('lastName', 'last name is required').trim().isLength({ min: 1 }).escape(),
        body('username').trim().isLength({ min: 1 }).withMessage('username is required')
            .custom(checkUsernameUniqueness).escape(),
        body('password').trim().isLength({ min: 5 }).withMessage('Password must be at least 5 characters long').escape(),
        body('confirm-password').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password confirmation does not match password');
            }

            return true;
        }),
        hashPassword,
    ]);

    router.get('/users', (req, res) => {
        Message.find({}).exec().then((users) => {
            res.render('users', { users: users });
        })
    });

    messageCrudFactory.create('user_form', {
        onSuccess: passport.authenticate("local", {
            successRedirect: "/",
            failureRedirect: "/",
        })
    });
    messageCrudFactory.read('user_detail', {
        getData: (req) => {
            return Message.findById(req.params.id).then((user) => {
                return {
                    user: user,
                }
            })
        }
    })


    messageCrudFactory.update('user_form');

    messageCrudFactory.remove('user_remove', { redirect: '/users' });
}
