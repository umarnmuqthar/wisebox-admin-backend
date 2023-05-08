const router = require('express').Router()
const companyController = require('../../controllers/common/Company_controller')
// const dataController = require('../../controllers/common/Data_controller')
// const { verifyAdminOrTeacherRole } = require('../../middlewares/verify_role')
// const { verifyAccessToken } = require('../../utils/jwt_helper')

router.get('/:slug', companyController.getCompanyTemplates)

router.get('/', companyController.getAllCompanyTemplates)

module.exports = router