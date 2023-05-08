const router = require('express').Router()
const slabController = require('../../controllers/app/Slab_controller')
const { verifySubscription } = require('../../middlewares/verify_subscription')
const { verifyAccessToken } = require('../../utils/jwt_helper')
// const { verifyAccessToken } = require('../../utils/jwt_helper')
// const { verifyAdminRole } = require('../../middlewares/verify_role')
 
router.get('/', verifyAccessToken, verifySubscription, slabController.getSlab)

router.get('/questions', verifyAccessToken, verifySubscription, slabController.getSlabQuestions)

router.post('/questions', verifyAccessToken, verifySubscription, slabController.postQuestionEvaluation)

/* NOTE: TEMP */
router.get('/suggestion', /* verifyAccessToken, */ verifySubscription, slabController.getSuggestion)

module.exports = router