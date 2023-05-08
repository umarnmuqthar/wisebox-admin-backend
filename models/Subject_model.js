const mongoose = require('mongoose')
const Schema = mongoose.Schema

/* Subject ie. zoology etc 
- name: ""
- board id
- class id
- chapters: []
- prevQ
- createdBy
*/

const SubjectSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            // unique: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            unique: true
        },
        // board: {
        //     type: mongoose.Types.ObjectId,
        //     required: true,
        //     ref: 'board'
        // },
        classId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'class'
        },
        chapters: [{
            type: mongoose.Types.ObjectId,
            ref: 'chapter'
        }],
        previousQuestions: [{
            type: mongoose.Types.ObjectId,
            ref: 'question'
        }],
        createdBy: {
            type: mongoose.Types.ObjectId,
            ref: 'user',
            required: true
        },
        active: {
            type: Boolean,
            default: true
        },
        deleted: {
            type: Boolean,
            default: false
        }
    }, 
    {
        timestamps: true
    }
)

module.exports = mongoose.model('subject', SubjectSchema)