const fileController = require("../controllers/file.controller");
const auth = require("../middleware/auth");

module.exports = function (app) {

    app.get('/tracker', auth.verifyToken, auth.isUser, fileController.getAllFiles);

    app.put('/tracker/files/update', auth.verifyToken, fileController.updateFileRecord);

    app.post('/tracker/files/save', auth.verifyToken, auth.isUser, fileController.createFileRecord);

    app.delete('/tracker/files/delete', auth.verifyToken, fileController.deleteFileRecord);

    app.put('/tracker/files/changeStatus', auth.verifyToken, fileController.updateFileRecordStatus);

    app.put('/tracker/files/approve', auth.verifyToken, auth.isAdmin, fileController.approveFileRecordStatus);

    app.get('/tracker/api/files/:fileId', fileController.getFileRecord);

}