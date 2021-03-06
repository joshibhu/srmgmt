//require('dotenv').config();
const fs = require('fs');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const config = require('../config/config.json');

const s3Config = new AWS.S3({
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
    Bucket: config.aws.bucket
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}


const multerS3Config = multerS3({
    s3: s3Config,
    bucket: config.aws.bucket,
    metadata: function (req, file, cb) {
        //console.log(file.fieldname);
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
        //console.log(file)
        cb(null, req.body.empId+'_SR'+path.extname(file.originalname))
    }
});

const upload = multer({
    storage: multerS3Config,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // we are allowing only 5 MB files
    }
})

async function downloadFile(filePath, key){
    return new Promise((resolve, reject)=>{
        const params = {
        Bucket: 'elasticbeanstalk-us-east-2-510137106449',
        Key: key
        };
        var file = fs.createWriteStream(filePath);
        s3Config.getObject(params).createReadStream().on('error', function(err){
            console.log(err+'######################');
        }).pipe(file);
        file.on('close', function(){
            resolve('done');  //prints, file created
        });
    });
    
};

async function uploadFile(filePath, key){
    return new Promise((resolve, reject)=>{
        fs.readFile(filePath, function (err, data) {
            if (err) { throw err; }
            const params = {
                Bucket: 'elasticbeanstalk-us-east-2-510137106449',
                Key: key,
                Body: Buffer.from(data),
            };
            s3Config.putObject(params, function(err, data) {
                if (err)
                  console.log(err)
                else
                  resolve("Successfully uploaded data ="+data);
            });  
        });
    });
    
};


exports.downloadServiceRec = downloadFile;
exports.uploadFile = uploadFile;
exports.uploadServiceRec = upload; 