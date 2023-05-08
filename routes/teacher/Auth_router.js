const router = require('express').Router()
const authController = require('../../controllers/teacher/Auth_controller')
const { verifyTeacherRole } = require('../../middlewares/verify_role')
const { verifyAccessToken } = require('../../utils/jwt_helper')


router.post('/register', authController.register)

router.post('/login', authController.login)

router.post('/refresh-token', authController.refresh_token)

router.delete('/logout', authController.logout)

router.get('/', verifyAccessToken, verifyTeacherRole, authController.getUser)

module.exports = router