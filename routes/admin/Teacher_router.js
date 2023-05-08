const router = require('express').Router()
const teacherController = require('../../controllers/admin/Teacher_controller')
const { verifyAccessToken } = require('../../utils/jwt_helper')
const { verifyAdminRole } = require('../../middlewares/verify_role')

router.get('/', verifyAccessToken, verifyAdminRole, teacherController.getTeachers)

router.post('/', verifyAccessToken, verifyAdminRole, teacherController.addTeacher)

router.put('/', verifyAccessToken, verifyAdminRole, teacherController.updateTeacher)

router.delete('/:id', verifyAccessToken, verifyAdminRole, teacherController.deleteTeacher)

module.exports = router