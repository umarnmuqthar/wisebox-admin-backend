const cloudinary = require('cloudinary')

cloudinary.config({ 
    cloud_name: 'ddy3yzzeu', 
    api_key: '532993885417885', 
    api_secret: 'a3fNviqjH1QDAMLtGX0-OlUEf-Q' 
})

const upload = (file) => {
    return new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload(
        file,
        (err, result) => {
            if(err) reject(err)
            resolve({ url: result.url, id: result.public_id });
        },
        // { resource_type: "auto" }
      );
    });
  };

const deleteImage = (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.destroy(
      publicId, 
      function(err, result) { 
        if(err) reject(err)
        resolve(result)
      });
  })
}

module.exports = {
    cloudinary,
    upload,
    deleteImage
}