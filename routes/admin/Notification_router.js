const router = require('express').Router()
const notificationController = require('../../controllers/admin/Notification_controller')
const { verifyAdminRole } = require('../../middlewares/verify_role')
const { verifyAccessToken } = require('../../utils/jwt_helper')

router.post('/', verifyAccessToken, verifyAdminRole, notificationController.sendNotification)

module.exports = router