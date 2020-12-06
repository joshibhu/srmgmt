const userController = require("../controllers/userController_bs");
const auth = require("../middleware/auth");

module.exports = function (app) {
    app.get('/register', userController.register);

    app.get('/user', auth.verifyToken, auth.isAdmin, userController.getAllUsers);

    app.delete('/user', auth.verifyToken, auth.isAdmin, userController.deleteUser);

    app.put('/user', auth.verifyToken, auth.isAdmin, userController.updateUser);

}