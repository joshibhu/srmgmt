const fileController = require("../controllers/fileController");
const fileController_bs = require("../controllers/fileController_bs");
const auth = require("../middleware/auth");

module.exports = function (app) {

    app.get('/tracker', auth.verifyToken, auth.isUser, fileController_bs.getAllFiles);

    app.put('/tracker/files/update', auth.verifyToken, fileController_bs.updateFileRecord);

    app.post('/tracker/files/save', auth.verifyToken, auth.isUser, fileController_bs.createFileRecord);

    app.delete('/tracker/files/delete', auth.verifyToken, fileController_bs.deleteFileRecord);

    app.put('/tracker/files/changeStatus', auth.verifyToken, fileController_bs.updateFileRecordStatus);

    app.put('/tracker/files/approve', auth.verifyToken, auth.isAdmin, fileController_bs.approveFileRecordStatus);

    app.get('/tracker/api/files/:fileId', fileController_bs.getFileRecord);

    app.get('/tracker/files/viewAll', function (req, res) {
        res.render('addRecord', { message: {} });
    });

    app.get('/tracker/update/:fileId', fileController.getFileRecordForUpdate);

    app.get('/tracker/api/files/:fileId', fileController.getFileRecord);

    app.delete('/tracker/api/files/:fileId', fileController.deleteFileRecord);

    app.get('/tracker/api/files', fileController.getAllFiles);

    app.post('/tracker/api/files', fileController.createFileRecord);

    app.put('/tracker/api/files/:fileId', fileController.updateFileRecord);

    app.put('/tracker/api/files/:fileId/action/:action', fileController.updateFileRecordStatus);
}