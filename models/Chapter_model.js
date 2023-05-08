const mongoose = require('mongoose')
const Schema = mongoose.Schema

/* chapter ie. zoology- animal kingdom etc 
- name: ""
- board id
- class id
- subject id
- slabs: []
*/

const ChapterSchema = new Schema(
    {
        idx: {
            type: Number,
            // unique: true,
            minimum: 1,
            required: true
        },
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
        //     // required: true,
        //     ref: 'board'
        // },
        // classId: {
        //     type: mongoose.Types.ObjectId,
        //     // required: true,
        //     ref: 'class'
        // },
        subject: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'subject'
        },
        slabs: [{
            type: mongoose.Types.ObjectId,
            ref: 'slab'
        }],
        createdBy: {
            type: mongoose.Types.ObjectId,
            ref: 'user',
            required: true
        },
        active: {
            type: Boolean,
            default: false
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

module.exports = mongoose.model('chapter', ChapterSchema)