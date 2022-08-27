const { body, validationResult } = require('express-validator');

module.exports = function (router, routeName, ItemModel, itemFactory) {
    let validation = [];
    function setValidation(newValidation) {
        validation = newValidation;
    }

    function create(viewName, getData = () => { return Promise.resolve({}) }) {
        router.get(routeName + '/create', (req, res) => {
            getData(req).then((data) => {
                res.render(viewName, data);
            })
        });

        router.post(routeName + '/create', validation.concat([
            (req, res, next) => {
                const errors = validationResult(req);

                ///the names in the view form need to be exactly the same as the model
                const itemObject = itemFactory(req);
                const itemDb = new ItemModel(itemObject);

                if (!errors.isEmpty()) {
                    getData(req).then((data) => {
                        res.render(viewName, { ...data, itemObject, errors: errors.array() });
                    })
                }

                ItemModel.findOne(itemObject).exec()
                    .then(
                        (foundItem) => {
                            if (foundItem) {
                                res.redirect(foundItem.url);
                            } else {
                                itemDb.save().then(
                                    () => {
                                        res.redirect(itemDb.url);
                                    },
                                    (err) => {
                                        next(err);
                                    }
                                )
                            }
                        },
                        (err) => {
                            next(err);
                        }
                    )
            }
        ]));
    }
    function read(viewName, getData = () => { return Promise.resolve({}) }) {
        //console.log(data);
        router.get(routeName + '/:id', (req, res) => {
            getData(req).then((data) => {
                res.render(viewName, data);
            })
        });

    }

    return {
        setValidation,
        create,
        read,
    }
}