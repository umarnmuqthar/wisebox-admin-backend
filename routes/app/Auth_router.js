const router = require('express').Router()
const authController = require('../../controllers/app/Auth_controller')
const { verifyAccessToken } = require('../../utils/jwt_helper')
const path = require('path')

const multer = require('multer')
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/images');
        },
        filename: (req, file, cb) => {
            // console.log(file)
            // cb(null, Date.now() + path.extname(file.originalname));
            cb(null, file.originalname);
        }
    }),
    limits: {fileSize: 4194304 } 
})
// router.post('/signup', authController.register)/* TODO: */

router.post('/sendotp', authController.send_otp)

router.post('/verifyotp', authController.verify_otp)

router.post('/refresh-token', authController.refresh_token)

router.delete('/logout', authController.logout)

router.get('/', verifyAccessToken, authController.get_student)

router.post('/update', verifyAccessToken, authController.update_student)

router.post('/update-profile-image', 
    upload.fields([{ name: 'image', maxCount: 1 }]),
    verifyAccessToken, authController.update_profile_pic)

module.exports = router