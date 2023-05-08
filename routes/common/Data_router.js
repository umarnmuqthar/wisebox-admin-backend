const router = require('express').Router()
const chapterController = require('../../controllers/common/Chapter_controller')
const dataController = require('../../controllers/common/Data_controller')
const { verifyAdminOrTeacherRole } = require('../../middlewares/verify_role')
const { verifyAccessToken } = require('../../utils/jwt_helper')

router.get('/boards', dataController.getBoards)

router.get('/board/:boardSlug', dataController.getBoard)

router.get('/class/:classSlug', dataController.getClass)

router.get('/subject/:subjectSlug', dataController.getSubject)

router.get('/chapter/:chapterSlug', verifyAccessToken, verifyAdminOrTeacherRole, chapterController.getChapter)

module.exports = router