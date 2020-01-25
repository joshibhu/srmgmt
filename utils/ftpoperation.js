//require('dotenv').config();
const fs = require('fs');
const path = require('path');
const config = require('../config/config.json');
var EasyFtp = require('easy-ftp');
const merge = require('easy-pdf-merge');


var ftpDir = '/servicerecords';

var ftpconfig = {
    host: '192.168.1.10',
    port: 21,
    username: 'ftp-user',
    password: '24111987',
    type : 'ftp'
};

var ftp = new EasyFtp();

//check if ftp directory exist or not :: if not create it

function uploadFtp(req,empId){    
    ftp.connect(ftpconfig);
    return new Promise(function(resolve,reject){
        let remotefilePath = path.join(ftpDir,empId,req.file.filename);        
        try{
            console.log(remotefilePath+'#######################');
            ftp.upload(req.file.path, remotefilePath, function(err){
                if(err){
                    console.log(err);
                    reject(err);
                }else{
                    console.log('it is resolved...strange ');
                    resolve(true);                    	
                }
            });
        }catch(err){
            console.log(err);
            reject(err);
        }
    });
}


function downloadFtp(empId, tmpUploadDir){
    ftp.connect(ftpconfig);
    return new Promise(function(resolve,reject){
        var filepath = path.join(ftpDir, empId);
        ftp.download(filepath, tmpUploadDir, function(err){  
            if(err){
                reject(err);
            }else{
                // merge and send as response
                let sourcefilespath = path.join(tmpUploadDir,empId);
                let destinationfilepath = path.join(tmpUploadDir,empId, empId+'_SR.pdf');
                fs.readdir(sourcefilespath, function (err, files) {
                    //handling error
                    if (err) {
                        reject(err);
                    }else{
                        //listing all files using forEach
                        let sourcefilearray = [];
                        files.forEach(function (file) {
                            // Do whatever you want to do with the file
                            sourcefilearray.push(path.join(tmpUploadDir,empId,file)); 
                        });
                        merge(sourcefilearray,destinationfilepath,function(err){
                            if(err) {
                               reject(err);
                            }
                            console.log('####################'+destinationfilepath);
                            resolve(destinationfilepath);                          
                        });
                    }
                
                });
            }
        });
    });
}


module.exports.uploadFtp = uploadFtp; 
module.exports.downloadFtp = downloadFtp; 