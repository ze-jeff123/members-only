const bcrypt = require('bcryptjs');

module.exports = (req, res, next) => {
    bcrypt.hash(req.body.password, 10).then((hashedPassword) => {
        req.body.password = hashedPassword;
        next();
    });
}