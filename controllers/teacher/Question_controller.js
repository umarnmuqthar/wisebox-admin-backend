const createError = require('http-errors')
const slugify = require('slugify')
const shortId = require('shortid')
const { addQuestionSchema, updateQuestionSchema } = require('../../utils/validation_schema/question_schema')
const Slab = require('../../models/Slab_model')
const Question = require('../../models/Question_model')
// const {upload, deleteImage} = require('../../utils/cloudinary_helper')
const {uploadFile, deleteFile} = require('../../utils/aws_s3_helper')
const imageResizer = require('../../utils/resize_Image')

module.exports = {
    addQuestion: async (req, res, next) => {
        try {
            /* Question 
            - slug
            - slabSlug
            - question: ""
            - questionMeta: {
                metaType: "",
                imageUrl: "",
                list: [],
                table: {
                    tableHead: [],
                    tableRows: [{ id: "", items: []}]
                }
            }
            - answers: []
            - explanation: ""
            - explanationMeta: {
                metaType: "",
                imageUrl: "",
                list: [],
                table: {
                    tableHead: [],
                    tableRows: [{ id: "", items: []}]
                }
            } 
            - active
            */

            const data = await addQuestionSchema.validateAsync(JSON.parse(req.body.data))
            // const data = await addQuestionSchema.validateAsync(req.body)

            /* find the slab */
            const slab = await Slab.findOne({ slug: data.slabSlug }).exec()

            if(!slab) throw createError.BadRequest('Slab does not exist')

            const optionVal = ["A", "B", "C", "D"]
            const answers = data.answers.map((text, idx) => text !== "" &&
                     {
                        optionIndex: idx,
                        option: optionVal[idx],
                        text
                    }
            ).filter(Boolean)

            if(answers.length < 2) throw createError.BadRequest("Minimum 2 options are required.")

            //TODO: if image is present upload to server and add the url to it
            if(data.questionMeta.metaType === "image") {
                // console.log(req.files['questionMetaImage'])
                const file = req.files['questionMetaImage'][0]

                const resizedImage = await imageResizer(file)
                
                file.filename = resizedImage.filename
                file.path = resizedImage.filepath
                // file.filename= (await resized_image).filename
                // file.path = (await resized_image).path

                const qImage = await uploadFile(file, '/images/question')
                data.questionMeta.imageUrl = qImage.Location
                data.questionMeta.imageKey = qImage.Key
            }
            if(data.explanationMeta.metaType === "image") {
                // console.log(req.files['questionMetaImage'])
                const file = req.files['explanationMetaImage'][0]

                const resizedImage = await imageResizer(file)
                
                file.filename = resizedImage.filename
                file.path = resizedImage.filepath
                
                const expImage = await uploadFile(file, '/images/question')
                data.explanationMeta.imageUrl = expImage.Location
                data.explanationMeta.imageKey = expImage.Key
            }
            
            const newQuestion = new Question({
                // question,
                // slug: `${slab.slug}-${slab.questions.length+1}`,
                slug: shortId.generate(),
                createdBy: req.payload.id,
                ...data,
                answers
            })
            
            const question = await newQuestion.save()

            slab.questions.push(question._id)
            await slab.save()
            
            res.send({ data: question })
        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },

    updateQuestion: async (req, res, next) => {
        try {

            const data = await updateQuestionSchema.validateAsync(JSON.parse(req.body.data))/* TODO: fix validation */
            // const data = req.body.data
            // console.log(data)
            const { questionId } = req.params
            // const createdBy = req.payload.id

            let question = await Question.findOne({ _id: questionId/* , createdBy */ }).exec()
            if(!question) throw createError.BadRequest("Access denied / Does not exist")

            const optionVal = ["A", "B", "C", "D"]
            const answers = /* req.body. */data.answers.map((text, idx) => text !== "" &&
                     {
                        optionIndex: idx,
                        option: optionVal[idx],
                        text
                    }
            ).filter(Boolean)

            if(answers.length < 2) throw createError.BadRequest("Minimum 2 options are required.")

            //TODO: if image is present upload to server and add the url to it
            //TODO: delete the old image

            if(data.questionMeta.metaType === "image" && (req.files['questionMetaImage'] !== undefined)) {
                // console.log("img:", req.files['questionMetaImage'])

                /* delete old if exists */
                if(question.questionMeta.imageKey) {
                    await deleteFile(question.questionMeta.imageKey)
                }

                
                const file = req.files['questionMetaImage'][0]
                const resizedImage = await imageResizer(file)
                
                file.filename = resizedImage.filename
                file.path = resizedImage.filepath
                const qImage = await uploadFile(file, '/images/question')
                data.questionMeta.imageUrl = qImage.Location
                data.questionMeta.imageKey = qImage.Key
            }
            if(data.explanationMeta.metaType === "image" && (req.files['explanationMetaImage'] !== undefined)) {
                // console.log(req.files['questionMetaImage'])

                /* delete old if exists */
                if(question.explanationMeta.imageKey) {
                    await deleteFile(question.explanationMeta.imageKey)
                }

                const file = req.files['explanationMetaImage'][0]
                const resizedImage = await imageResizer(file)
                
                file.filename = resizedImage.filename
                file.path = resizedImage.filepath
                const expImage = await uploadFile(file, '/images/question')
                data.explanationMeta.imageUrl = expImage.Location
                data.explanationMeta.imageKey = expImage.Key
            }
            
            question = await Question.findByIdAndUpdate(
                questionId,
                {
                    ...data,
                    answers
                }
            ).exec()
            // console.log("Data: ", data)
            // console.log("Q: ", question)
            res.send({ data: question })
        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },

    delete_question: async(req, res, next) => {
        try {
            const { questionId } = req.params
            // const createdBy = req.payload.id
            if (!questionId) throw createError.BadRequest("Question id is required")

            //verify wether the question was created by the same tutor
            const question = await Question.findOneAndDelete({ _id: questionId/* , createdBy */})

            if(!question) throw createError.BadRequest("Access denied / Does not exist")

            //NOTE: delete old image
            if(question.questionMeta.metaType === "image") {
                await deleteFile(question.questionMeta.imageKey)
            }
            if(question.explanationMeta.metaType === "image") {
                await deleteFile(question.explanationMeta.imageKey)
            }

            //NOTE: remove from slab
            await Slab.updateOne({ slug: question.slabSlug }, { $pull: { questions: question._id }}).exec()

            res.send({ data: {
                    message: "Question deleted successfully"
                } 
            })
        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    }
}

