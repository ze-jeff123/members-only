const {body, validationReusult } = require('express-validator');

exports.setCrudRoutes = function (router, routeName, createView, readView, updateView, deleteView, itemConstructor, validation=[]) {
    ///Create
    router.get(routeName + '/create', (req, res) => {
        res.render(createView.name, crea)
    });

    router.post(routeName + '/create', validation.concat([
        (req, res, next) => {
            const errors = validationResult(req);

            const newItem = itemConstructor(req);

            if (!errors.isEmpty()) {

            }
        }
    ]));


    ///Read
    router.get(routeName, (req, res) => {
        res.render(createView.name, createView.options);
    });
}