const router = require('express').Router()
const slabController = require('../../controllers/common/Slab_controller')
const { verifyAdminRole } = require('../../middlewares/verify_role')
const { verifyAccessToken } = require('../../utils/jwt_helper')

router.post('/', verifyAccessToken, verifyAdminRole, slabController.addSlab)

module.exports = router