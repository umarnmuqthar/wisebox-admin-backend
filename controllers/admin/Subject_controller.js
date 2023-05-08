const createError = require('http-errors')
const slugify = require('slugify')
const shortId = require('shortid')
const { addSubjectSchema, addChapterSchema } = require('../../utils/validation_schema/subject_schema')
//models
const ClassModel = require('../../models/Class_model')
const Subject = require('../../models/Subject_model')
const Chapter = require('../../models/Chapter_model')
const { generateSlug } = require('../../utils/generateSlug')

module.exports = {
    addSubject: async (req, res, next) => {
        try {
            /* Subject ie. zoology etc 
            - name: ""
            - board id
            - class id
            - chapters: []
            - prevQ: []
            - createdBy
            */
            const { name, board, classId } = await addSubjectSchema.validateAsync(req.body)

            //TODO: send classId directly
            const classData = await ClassModel.findById(classId).exec()
            /*TODO: validate class is present or not */

            const newSubject = Subject({
                name,
                classId: classData._id,
                // board,
                slug: generateSlug(name),
                createdBy: req.payload.id
            })
            const subject = await newSubject.save()

            // push subject to class

            classData.subjects.push(subject._id)
            await classData.save()          
            
            res.send({ data: subject })
        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },

    //delete
    deleteSubject: async (req, res, next) => {
        try {
            const { subjectSlug } = req.params 

            const subject = await Subject.findOneAndUpdate({ slug: subjectSlug }, {deleted: true}).exec()
            if(!subject) throw createError.BadRequest("Access denied / Does not exist")

            res.send({ data: { message: "deleted" } })
        } catch (err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },

    //update
    updateSubject: async (req, res, next) => {
        try {
            const { subjectSlug } = req.params 
            const { name } = req.body 

            const subject = await Subject.findOneAndUpdate(
                {  slug: subjectSlug }, 
                {  name,
                   slug: generateSlug(name) 
                }).exec()

            res.send({ data: { message: "updated" } })
        } catch (err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    }
}

