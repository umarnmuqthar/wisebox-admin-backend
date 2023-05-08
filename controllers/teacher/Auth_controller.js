const createError = require('http-errors')
const User = require('../../models/User_model')
const Board = require('../../models/Board_model')
const { authSchema, authLoginSchema } = require('../../utils/validation_schema/auth_schema')
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/jwt_helper')
const client = require('../../utils/redis_helper')

module.exports = {
    getUser: async (req, res, next) => {
        try {
            // Send inital ui data and user data
            const userData = await User.findById(req.payload.id, "-password -_id -createdBy")
            const boards = await Board.find({})
                                .populate({ path: "classes", select: "name subjects slug"})
                                .exec()

            res.send({ 
                data: {
                    user: userData,
                    boards
                } 
            })
        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },
    
    register: async (req, res, next) => {
        try {
            const result = await authSchema.validateAsync(req.body)
    
            const userExists = await User.findOne({ email: result.email })
            if (userExists) throw createError.Conflict(`${result.email} is already been registered`)
    
            const user = new User(result)
            const savedUser = await user.save()
            const accessToken = await signAccessToken(savedUser.id, savedUser.role)
            const refreshToken = await signRefreshToken(savedUser.id, savedUser.role)
            res.send({ accessToken, refreshToken })
        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        }  
    },

    login: async (req, res, next) => {
        try {
            /*  only user with role teacher should be able to login*/

            const result = await authLoginSchema.validateAsync(req.body)
            // console.log(result)
            const user = await User.findOne({ email: result.email, role: "teacher" }) 
            if(!user) throw createError.NotFound('User not registered')

            const isMatch = await user.isValidPassword(result.password)
            if(!isMatch) throw createError.BadRequest('Username/password not valid')
            
            const accessToken = await signAccessToken(user.id, user.role)
            const refreshToken = await signRefreshToken(user.id, user.role)
            res.send({ accessToken, refreshToken })
        } catch(err) {
            if(err.isJoi) return next(createError.BadRequest('Invalid Username/Password'))
            next(err)
        }
    },

    refresh_token: async (req, res, next) => {
        try {
            const { refreshToken } = req.body
            if(!refreshToken) throw createError.BadGateway()
            const user = await verifyRefreshToken(refreshToken)
            const accessToken = await signAccessToken(user.id, user.role)
            res.send({ accessToken })
        } catch(err) {
            next(err)
        }
    },
    
    logout: async (req, res, next) => {
        try {
            const { refreshToken } = req.body
            if(!refreshToken) throw createError.BadRequest()
            const userId = await verifyRefreshToken(refreshToken)
            
            client.DEL(userId, (err, val) => {
                if(err) {
                    throw createError.InternalServerError()
                }
                res.sendStatus(204)
            })
        } catch(err) {
            next(err)
        }
    }
}