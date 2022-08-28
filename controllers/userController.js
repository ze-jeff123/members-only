
const CrudFactory = require('./CrudFactory');
const User = require("../models/user");
const { body } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const hashPassword = require('../util/hashPassword');

module.exports.setUserRoutes = function (router) {
    const userCrudFactory = CrudFactory(router, '/user', User, (req) => {
        return {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
            password: req.body.password,
            membershipStatus: 0, /// 0 - not a member, 1 - a member
        }
    });

    const checkUsernameUniqueness = (value) => {
        return User.findOne({ username: value }).exec().then((user) => {
            if (user) {
                return Promise.reject('Username already taken');
            }
        });
    }
    userCrudFactory.setValidation([
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
        User.find({}).exec().then((users) => {
            res.render('users', { users: users });
        })
    });

    userCrudFactory.create('user_form', {
        onSuccess: passport.authenticate("local", {
            successRedirect: "/",
            failureRedirect: "/",
        })
    });
    userCrudFactory.read('user_detail', {
        getData: (req) => {
            return User.findById(req.params.id).then((user) => {
                return {
                    user: user,
                }
            })
        }
    })


    userCrudFactory.update('user_form');

    userCrudFactory.remove('user_remove', { redirect: '/users' });
}

exports.logInGet = (req, res) => {
    res.render('log_in', { title: 'Log in' });
}

exports.logInPost =
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/",
    })


exports.logOutPost = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    })
}

exports.becomeAdminGet = function (req, res) {
    res.render('become_admin');
}

exports.becomeAdminPost = function (req, res) {
    if (!res.locals.currentUser) {
        return res.redirect('/');
    }
    if (req.body.secret === process.env.ADMIN_SECRET) {
        res.locals.currentUser.update({ isAdmin: true }).exec().then(() => {
            return res.redirect('/');
        })
    } else {
        return res.render('become_admin', { errors: ["Wrong pass code!"] });
    }
}

exports.becomeMemberGet = function (req, res) {
    res.render('become_member');

}

exports.becomeMemberPost = function (req, res) {
    if (!res.locals.currentUser) {
        return res.redirect('/');
    }
    if (req.body.secret === process.env.MEMBER_SECRET) {
        res.locals.currentUser.update({ membershipStatus: true }).exec().then(() => {
            return res.redirect('/');
        })
    } else {
        return res.render('become_member', { errors: ["Wrong pass code!"] });
    }
}