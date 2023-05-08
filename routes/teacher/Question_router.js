const router = require('express').Router()
const questionController = require('../../controllers/teacher/Question_controller')
const { verifyTeacherRole } = require('../../middlewares/verify_role')
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


router.post('/', verifyAccessToken, verifyTeacherRole,
    upload.fields([{ name: 'questionMetaImage', maxCount: 1 },
    { name: 'explanationMetaImage', maxCount: 1 }]),
    questionController.addQuestion)

router.delete('/:questionId', verifyAccessToken, verifyTeacherRole, questionController.delete_question)

router.put('/:questionId', verifyAccessToken, verifyTeacherRole, 
    upload.fields([{ name: 'questionMetaImage', maxCount: 1 },
            { name: 'explanationMetaImage', maxCount: 1 }]), 
    questionController.updateQuestion)

module.exports = router