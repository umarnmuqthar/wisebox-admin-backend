'use strict';
const express = require('express')
const cors = require("cors")
const createError = require('http-errors')
const logger = require('./utils/logger')

require('dotenv').config()
require('./utils/redis_helper')
require('./utils/mongoDb')

const app = express()

//middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

if (process.env.NODE_ENV === 'production') {
    console.log = logger.logLogger
} 

app.use((req, res, next) => {
    const info = `${req.method} ${req.url} - [${new Date().toUTCString()}]`
    logger.info(info)
    next()
})

/* common */
app.use('/data', require('./routes/common/Data_router'))
app.use('/company', require('./routes/common/Company_router'))

/* admin */
app.use('/admin/auth', require('./routes/admin/Auth_router'))
app.use('/admin/board', require('./routes/admin/Board_router'))
app.use('/admin/stream', require('./routes/admin/Stream_router'))
app.use('/admin/subject', require('./routes/admin/Subject_router'))
app.use('/admin/chapter', require('./routes/admin/Chapter_router'))
app.use('/admin/slab', require('./routes/admin/Slab_router'))
app.use('/admin/teacher', require('./routes/admin/Teacher_router'))
app.use('/admin/notification', require('./routes/admin/Notification_router'))

/* teacher */
app.use('/teacher/auth', require('./routes/teacher/Auth_router'))
app.use('/teacher/slab', require('./routes/common/Slab_router'))
app.use('/teacher/question', require('./routes/teacher/Question_router'))

/* student */
app.use('/auth', require('./routes/app/Auth_router'))
app.use('/subject', require('./routes/app/Subject_router'))
app.use('/subscription', require('./routes/app/Subscription_router'))
app.use('/slab', require('./routes/app/Slab_router'))
app.use('/course', require('./routes/app/Course_router'))
app.use('/notification', require('./routes/app/Notification_router'))

//not found
app.use(async (req, res, next) => {
    next(createError.NotFound(`Requested url: ${req.method} ${req.url}, Not Found`))
})
//error handler
app.use((err, req, res, next) => {
    
    const error = {
        status: err.status || 500,
        message: err.message,
    }
    
    if(err.isJoi) {
        err.status = 422
        
        const messages = err.details.map((field) => {
            return { [field.path[0]]: field.message}
        })

        const fieldErrors = Object.assign({}, ...messages)

        error.fieldErrors = fieldErrors
        error.message = "Validation Error"
        error.status = err.status
    }

    
    const regEx = new RegExp(`${process.cwd()}\\/(?!node_modules\\/)([\\/\\w-_\\.]+\\.js):(\\d*):(\\d*)`)
    const stack = err.stack.match(regEx)
    let info
    if (stack) {
        const [, filename, line, column ] = stack
        info = `${req.method} ${req.url} - [${err.status || 500}] [message: ${err.message}] - [${new Date().toUTCString()}], [${filename}:[${line} : ${column}]]`
    } else {
        info = `${req.method} ${req.url} - [${err.status || 500}] [message: ${err.message}] - [${new Date().toUTCString()}]`
    }
    logger.error(info)
    
    res.status(err.status || 500)
    res.send({ error })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))