const createError = require('http-errors')
const { addTeacherSchema, updateTeacherSchema } = require('../../utils/validation_schema/teacher_schema')
//models
const Teacher = require('../../models/User_model')

module.exports = {
    /* 
    - name
    - email
    - password
    - role
    - active
    - createdBy
    */
    addTeacher: async (req, res, next) => {
        try {
            const { name, email, password } = await addTeacherSchema.validateAsync(req.body)
            const createdBy = req.payload.id
            
            const newTeacher = Teacher({
                name,
                email,
                password,
                createdBy
            })

            let teacher = await newTeacher.save()

            teacher = teacher.toObject()
            delete teacher.password
            
            res.send({ data: teacher })
        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },

    getTeachers: async (req, res, next) => {
        try {
            const teachers = await Teacher.find({ role: "teacher"})
                                        .select("-password -role")
                                        .exec()
            res.send({ data: teachers })
        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },

    updateTeacher: async (req, res, next) => {
        /* 
        - teacher email
        - name
        - password
        - active
         */
        try {
            const {email, ...result} = await updateTeacherSchema.validateAsync(req.body)
            
            // const teacher = await Teacher.findOne({ email }, result, { new: true })
            //                         .select("-password -role")
            //                         .exec()
            const teacher = await Teacher.findOne({email})

            teacher.email = email
            teacher.name = result.name
            teacher.password = result.password
            teacher.active = result.active
            await teacher.save()

            res.send({ data: {message: "updated"} })
        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },

    deleteTeacher: async (req, res, next) => {
        try {
            const {id} = req.params

            if(!id) throw createError.BadRequest("Id is required")

            const teacher = await Teacher.findByIdAndDelete(id)
                                    .exec()
            if(!teacher) throw createError.BadRequest("Does not exist")

            res.send({data: { message: "Deleted"}})
        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    }
}