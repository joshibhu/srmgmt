const fileController = require("../controllers/fileController");
const fileController_bs = require("../controllers/fileController_bs");

module.exports = function (app) {

    // app.get('/tracker', function (req, res) {
    //     res.render('file_view', { message: {} });
    // });

    app.get('/tracker', fileController_bs.getAllFiles);

    app.put('/tracker/files/update', fileController_bs.updateFileRecord);

    app.post('/tracker/files/save', fileController_bs.createFileRecord);

    app.delete('/tracker/files/delete', fileController_bs.deleteFileRecord);

    app.put('/tracker/files/changeStatus', fileController_bs.updateFileRecordStatus);

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