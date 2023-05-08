const path = require('path')
const fs = require('fs')
const sharp = require('sharp')

const resizer = async (file) => {
    const filename = Date.now() + path.extname(file.originalname)
    const filepath = path.resolve(file.destination, filename)
    await sharp(file.path)
        .resize(800, 800, {fit: 'inside'})
        .toFile(filepath)
    fs.unlinkSync(file.path)

    return {filename, filepath}
}

module.exports = resizer