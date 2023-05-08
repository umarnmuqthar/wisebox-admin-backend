const Course_service = require('../../services/app/Course_service')

module.exports = {
    getCourses: async (req, res, next) => {
        try {

            const courses = await Course_service.getAllCourses()

            res.send(courses)
        } catch (err) {
            next(err)
        }
    },
}