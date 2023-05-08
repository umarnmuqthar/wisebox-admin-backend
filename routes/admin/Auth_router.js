const router = require('express').Router()
const authController = require('../../controllers/admin/Auth_controller')
const { verifyAccessToken } = require('../../utils/jwt_helper')
const { verifyAdminRole } = require('../../middlewares/verify_role')
 
router.post('/register', authController.register)

router.post('/login', authController.login)

router.post('/refresh-token', authController.refresh_token)

router.delete('/logout', authController.logout)

router.get('/', verifyAccessToken, verifyAdminRole, authController.getUser)

module.exports = router