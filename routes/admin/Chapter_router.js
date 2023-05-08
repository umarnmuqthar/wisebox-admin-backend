const router = require('express').Router()
const chapterController = require('../../controllers/common/Chapter_controller')
const { verifyAdminRole } = require('../../middlewares/verify_role')
const { verifyAccessToken } = require('../../utils/jwt_helper')

router.post('/', verifyAccessToken, verifyAdminRole, chapterController.addChapter)

router.put('/:chapterSlug', verifyAccessToken, verifyAdminRole, chapterController.updateChapter)

router.delete('/:chapterSlug', verifyAccessToken, verifyAdminRole, chapterController.deleteChapter)

module.exports = router