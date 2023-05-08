const mongoose = require('mongoose')
const Schema = mongoose.Schema

/* Slab 
- title: ""
- slug
- board id
- class id
- subject
- chapter id
- questions: []
- createdBy
-active
*/

const SlabSchema = new Schema(
    {
        idx: {
            type: Number,
            // unique: true,
            minimum: 1,
            required: true,
        },
        title: {
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
        // class: {
        //     type: mongoose.Types.ObjectId,
        //     // required: true,
        //     ref: 'class'
        // },
        // subject: {
        //     type: mongoose.Types.ObjectId,
        //     // required: true,
        //     ref: 'subject'
        // },
        points: [{
            type: String
        }],
        chapter: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'chapter'
        },
        questions: [{
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

module.exports = mongoose.model('slab', SlabSchema)