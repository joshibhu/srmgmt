const fileController = require("../controllers/fileController");

module.exports = function (app) {

    app.get('/tracker/api/files/:fileId', fileController.getFileRecord);

    app.get('/tracker/api/files', fileController.getAllFiles);

    app.post('/tracker/api/files', fileController.createFileRecord);

    app.put('/tracker/api/files/:fileId', fileController.updateFileRecord);

    app.put('/tracker/api/files/:fileId/action/:action', fileController.updateFileRecordStatus);
}