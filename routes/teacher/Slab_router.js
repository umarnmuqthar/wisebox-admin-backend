const router = require('express').Router()
const slabController = require('../../controllers/common/Slab_controller')
const { verifyTeacherRole } = require('../../middlewares/verify_role')
const { verifyAccessToken } = require('../../utils/jwt_helper')


router.post('/', verifyAccessToken, verifyTeacherRole, slabController.addSlab)

router.get('/:slabSlug', verifyAccessToken, verifyTeacherRole, slabController.getSlab)

module.exports = router