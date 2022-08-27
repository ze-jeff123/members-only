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
                    });
                    return;
                }

                itemDb.save().then(
                    () => {
                        res.redirect(itemDb.url);
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

    function update(viewName, getData = () => { return Promise.resolve({}) }) {
        router.get(routeName + '/:id/update', (req, res, next) => {
            Promise.all([
                getData(req),
                ItemModel.findById(req.params.id),
            ])
                .then(
                    ([data, itemObject]) => {
                        res.render(viewName, { ...data, itemObject });
                    },
                    (err) => {
                        next(err);
                    }
                )
        });

        router.post(routeName + '/:id/update', [
            validation.concat(
                (req, res, next) => {
                    const errors = validationResult(req);

                    ///the names in the view form need to be exactly the same as the model
                    const itemObject = itemFactory(req);

                    if (!errors.isEmpty()) {
                        getData(req).then((data) => {
                            res.render(viewName, { ...data, itemObject, errors: errors.array() });
                        });
                        return;
                    }

                    ItemModel.findByIdAndUpdate(req.params.id, itemObject).exec().then(
                        (newItem) => {
                            res.redirect(newItem.url);
                        },
                        (err) => {
                            next(err);
                        }
                    )
                }
            )
        ]);
    }

    function remove(viewName, {redirect='/'} = {}, getData = () => { return Promise.resolve({}) }) {
        router.get(routeName + '/:id/remove', (req, res, next) => {
            Promise.all([
                getData(req),
                ItemModel.findById(req.params.id),
            ])
                .then(
                    ([data, itemObject]) => {
                        res.render(viewName, { ...data, itemObject });
                    },
                    (err) => {
                        next(err);
                    }
                )
        });

        router.post(routeName + '/:id/remove', 
                (req, res, next) => {
                    ItemModel.findByIdAndRemove(req.params.id).exec().then(
                        () => {
                            res.redirect(redirect);
                        },
                        (err) => {
                            next(err);
                        }
                    )
                }
            
        );
    }

    return {
        setValidation,
        create,
        read,
        update,
        remove,
    }
}