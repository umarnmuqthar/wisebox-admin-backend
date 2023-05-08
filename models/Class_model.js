const mongoose = require('mongoose')
const Schema = mongoose.Schema

/* Class ie. 10, 11 etc 
- name: ""
- board id
- slug
- subjects: []
- createdBy
*/

const ClassSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            // unique: true,
            trim: true
        },
        idx: {
            type: Number,
            required: true,
            // unique: true
        },
        slug: {
            type: String,
            required: true,
            unique: true
        },
        board: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'board'
        },
        subjects: [{
            type: mongoose.Types.ObjectId,
            ref: 'subject'
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

module.exports = mongoose.model('class', ClassSchema)