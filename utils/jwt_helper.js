const jwt = require('jsonwebtoken')
const createError = require('http-errors') 
const client = require('./redis_helper')

module.exports = {
    signAccessToken: (userId, role="") => {
        return new Promise((resolve, reject) => {
            const payload = {
                id: userId,
                role 
            }
            const secret = process.env.ACCESS_TOKEN_SECRET
            const options = {
                expiresIn: `${15 * 60}s`,
            }
            jwt.sign(payload, secret, options, (err, token) => {
              if(err) {
                  console.log(err.message)
                  reject(createError.InternalServerError())
              }
              resolve(token)  
            })
        })
    },

    verifyAccessToken: (req, res, next) => {
        if (!req.headers['authorization']) return next(createError.Unauthorized())
        const token = req.headers['authorization'].split(' ')[1]
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if(err) {
                const message = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
                return next(createError.Unauthorized(message))
            }
            req.payload = payload
            next()
        })   
    },

    signRefreshToken:  (userId, role="") => {
        return new Promise((resolve, reject) => {
            const payload = {
                id: userId,
                role
            }
            const secret = process.env.REFRESH_TOKEN_SECRET
            const options = {
                expiresIn: "90d",
            }
            jwt.sign(payload, secret, options, (err, token) => {
              if(err) {
                //   console.log(err.message)
                  reject(createError.InternalServerError())
              }

              client.SET(userId.toString(), token, 'EX', 365*24*60*60, (err, reply) => {
                if(err) {
                    // console.log(err.message)  
                    reject(createError.InternalServerError())
                    return
                }
                resolve(token)  
              })
            })
        })
    },

    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
                if(err) return reject(createError.Unauthorized())
                const userId = payload.id

                client.GET(userId, (err, result) => {
                    if(err) {
                        // console.log(err.message)
                        reject(createError.InternalServerError())
                        return
                    }
                    if (refreshToken === result) return resolve(payload)
                    reject(createError.Unauthorized())
                })
            })
        })
    }
}