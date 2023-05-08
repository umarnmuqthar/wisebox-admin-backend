const router = require('express').Router()
const subjectController = require('../../controllers/admin/Subject_controller')
// const chapterController = require('../../controllers/common/Chapter_controller')
const dataController = require('../../controllers/common/Data_controller')
const { verifyAdminRole } = require('../../middlewares/verify_role')
const { verifyAccessToken } = require('../../utils/jwt_helper')

router.get('/:classSlug', verifyAccessToken, dataController.getSubjects)

router.post('/', verifyAccessToken, verifyAdminRole, subjectController.addSubject)

router.put('/:subjectSlug', verifyAccessToken, verifyAdminRole, subjectController.updateSubject)

router.delete('/:subjectSlug', verifyAccessToken, verifyAdminRole, subjectController.deleteSubject)

// router.post('/chapter', verifyAccessToken, verifyAdminRole, chapterController.addChapter)

module.exports = router