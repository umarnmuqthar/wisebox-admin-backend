const router = require('express').Router()
const slabController = require('../../controllers/common/Slab_controller')
const { verifyTeacherRole, verifyAdminOrTeacherRole } = require('../../middlewares/verify_role')
const { verifyAccessToken } = require('../../utils/jwt_helper')


router.post('/', verifyAccessToken, verifyAdminOrTeacherRole, slabController.addSlab)

router.get('/:slabSlug', verifyAccessToken, verifyAdminOrTeacherRole, slabController.getSlab)

router.put('/:slabSlug', verifyAccessToken, verifyAdminOrTeacherRole, slabController.updateSlab)

router.delete('/:slabSlug', verifyAccessToken, verifyAdminOrTeacherRole, slabController.deleteSlab)

router.put('/points/:slabSlug', verifyAccessToken, verifyTeacherRole, slabController.updateSlabPoints)

module.exports = router