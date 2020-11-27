const authController = require("../controllers/auth.controller");
const verifySignUp = require("../middleware/verifySignUp");

module.exports = function (app) {
    app.get('/', authController.login);

    app.post('/signin', authController.signin);

    app.post('/signup', verifySignUp.checkDuplicateEmail, authController.signup);

    app.get('/signout', authController.signout);
}
