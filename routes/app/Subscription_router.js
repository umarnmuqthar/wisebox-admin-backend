const router = require('express').Router()
const subscriptionController = require('../../controllers/app/Subscription_controller')
const { verifyAccessToken } = require('../../utils/jwt_helper')
// const { verifyAdminRole } = require('../../middlewares/verify_role')
 
router.post('/', verifyAccessToken, subscriptionController.addSubscription)

router.post('/order-payment', verifyAccessToken, subscriptionController.order_payment)

router.post('/verify-payment', subscriptionController.verify_payment)

router.get('/analytics', verifyAccessToken, subscriptionController.getProgress)

router.get('/leaderboard', verifyAccessToken, subscriptionController.getLeaderboard)

router.get('/:subscriptionId', verifyAccessToken, subscriptionController.getSubscription)

module.exports = router