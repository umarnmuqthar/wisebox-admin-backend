const router = require('express').Router()
const courseController = require('../../controllers/app/Course_controller')
const { verifyAccessToken } = require('../../utils/jwt_helper')
// const { verifyAccessToken } = require('../../utils/jwt_helper')
// const { verifyAdminRole } = require('../../middlewares/verify_role')
 
router.get('/', verifyAccessToken, courseController.getCourses)

module.exports = router