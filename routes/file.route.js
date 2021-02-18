const fileController = require("../controllers/file.controller");
const auth = require("../middleware/auth");

module.exports = function (app) {

    app.get('/tracker', auth.verifyToken, fileController.getAllFiles);

    app.get('/tracker/subheads/:head_code', auth.verifyToken, fileController.getSubheads);

    app.put('/tracker/files/update', auth.verifyToken, fileController.updateFileRecord);

    app.post('/tracker/files/save', auth.verifyToken, auth.isUser, fileController.createFileRecord);

    app.delete('/tracker/files/delete', auth.verifyToken, fileController.deleteFileRecord);

    app.put('/tracker/files/changeStatus', auth.verifyToken, fileController.updateFileRecordStatus);

    app.put('/tracker/files/approve', auth.verifyToken, auth.isFxUser, fileController.approveFileRecordStatus);

    app.put('/tracker/files/return', auth.verifyToken, auth.isFxUser, fileController.returnFileRecordStatus);

    app.get('/tracker/api/files/:fileId', fileController.getFileRecord);

    app.get('/tracker/files/onbehalfUser/:on_behalf_user_id', auth.verifyToken, fileController.getAmountLimits);

}