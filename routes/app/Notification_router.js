const router = require('express').Router()
const notificationController = require('../../controllers/app/Notification_controller')
const { verifyAdminRole } = require('../../middlewares/verify_role')
const { verifyAccessToken } = require('../../utils/jwt_helper')

router.post('/register', verifyAccessToken, notificationController.registerNotificationService)

module.exports = router