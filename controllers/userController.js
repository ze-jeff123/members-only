
const CrudFactory = require('./CrudFactory');
const User = require("../models/user");
const { body } = require('express-validator');

module.exports.setUserRoutes = function (router) {
    const userCrudFactory = CrudFactory(router, '/user', User, (req) => ({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        password: req.body.password,
        membershipStatus: 0, /// 0 - not a member, 1 - a member
    }));

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
            console.log(value, req.body.password);
            if (value !== req.body.password) {
                throw new Error('Password confirmation does not match password');
            }

            return true;
        })
    ]);

    router.get('/users', (req, res) => {
        User.find({}).exec().then((users) => {
            res.render('users', { users: users });
        })
    });

    userCrudFactory.create('user_form');
    userCrudFactory.read('user_detail', (req) => {
        return User.findById(req.params.id).then((user) => {
            return {
                user: user,
            }
        })
    });

    userCrudFactory.update('user_form');

    userCrudFactory.remove('user_remove', { redirect: '/users' });
}