
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
            author: req.user,
        }
    });

    messageCrudFactory.setValidation([
        body('title', "Title is required").trim().isLength({ min: 1 }).escape(),
        body('text', 'text is required').trim().isLength({ min: 1 }).escape(),
        body("title", "You must be logged in").custom((value, {req}) => {
            return (!!req.user) ;
        })
    ]);

    messageCrudFactory.create('message_form');

    messageCrudFactory.read('message_detail', {
        getData: (req) => {
            return Message.findById(req.params.id).then((message) => {
                return {
                    message: message,
                }
            })
        }
    })


    messageCrudFactory.update('message_form');

    messageCrudFactory.remove('message_remove', { redirect: '/' });
}
