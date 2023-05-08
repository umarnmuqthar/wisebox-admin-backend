const S3 = require('aws-sdk/clients/s3')
const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)
const sharp = require('sharp')
const path = require('path')

const s3 = new S3({
    region: process.env.AWS_BUCKET_REGION,
    accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.AWS_BUCKET_SECRET_KEY
})

const bucketName = process.env.AWS_BUCKET_NAME

//upload a file
const uploadFile = async (file, location=null) => {
    const fileStream = fs.createReadStream(file.path)

    const uploadParams = {
        Bucket: location ? bucketName+location : bucketName,
        Body: fileStream,
        Key: file.filename,
        ACL:'public-read',
        ContentType: 'image/png',
    }

    return s3.upload(uploadParams)
            .promise()
            .finally(() => unlinkFile(file.path))
}

//access a file
const getFileStream = (fileKey) => {
    const getParams = {
        Bucket: bucketName,
        Key: fileKey
    }

    return s3.getObject(getParams).createReadStream()
}

//delete a file
const deleteFile = (fileKey) => {
    const getParams = {
        Bucket: bucketName,
        Key: fileKey
    }

    return s3.deleteObject(getParams).promise()
}

const unlinkLocalFile = (filePath) => {
    return new Promise((resolve, reject) => unlinkFile(filePath)
        .then((data) => resolve(data))
        .catch(err => reject(err)))
}

module.exports = {
    uploadFile,
    getFileStream,
    deleteFile,
    unlinkLocalFile
}