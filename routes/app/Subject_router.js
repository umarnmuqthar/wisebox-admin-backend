const router = require('express').Router()
const subjectController = require('../../controllers/app/Subject_controller')
const { verifySubscription } = require('../../middlewares/verify_subscription')
const { verifyAccessToken } = require('../../utils/jwt_helper')
// const { verifyAccessToken } = require('../../utils/jwt_helper')
// const { verifyAdminRole } = require('../../middlewares/verify_role')
 
router.get('/', verifyAccessToken, /* verifySubscription, */ subjectController.getSubject)

module.exports = router