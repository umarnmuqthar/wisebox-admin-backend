const router = require('express').Router()
const streamController = require('../../controllers/admin/Stream_controller')
// const dataController = require('../../controllers/common/Data_controller')
const { verifyAdminRole } = require('../../middlewares/verify_role')
const { verifyAccessToken } = require('../../utils/jwt_helper')


router.get('/:classSlug', verifyAccessToken, streamController.getStreams)

router.post('/', verifyAccessToken, verifyAdminRole, streamController.addStream)

router.put('/:streamSlug', verifyAccessToken, verifyAdminRole, streamController.updateStream)

router.delete('/:streamSlug', verifyAccessToken, verifyAdminRole, streamController.deleteStream)

module.exports = router