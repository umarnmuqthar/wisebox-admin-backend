const router = require('express').Router()
const boardController = require('../../controllers/admin/Board_controller')
const dataController = require('../../controllers/common/Data_controller')
const { verifyAdminRole } = require('../../middlewares/verify_role')
const { verifyAccessToken } = require('../../utils/jwt_helper')


router.get('/', verifyAccessToken, dataController.getBoards)

router.post('/', verifyAccessToken, verifyAdminRole, boardController.addBoard)

router.put('/:boardSlug', verifyAccessToken, verifyAdminRole, boardController.updateBoard)

router.delete('/:boardSlug', verifyAccessToken, verifyAdminRole, boardController.deleteBoard)

router.post('/class', verifyAccessToken, verifyAdminRole, boardController.addClass)

router.put('/class/:classSlug', verifyAccessToken, verifyAdminRole, boardController.updateClass)

router.delete('/class/:classSlug', verifyAccessToken, verifyAdminRole, boardController.deleteClass)

module.exports = router