const mongoose = require('mongoose')
const Schema = mongoose.Schema

/* Stream
- name
- slug
- board
- classId
- subjects
- createdBy
- active
- deleted
*/

const StreamSchema = new Schema(
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
        board: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'board'
        },
        classId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'class'
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

module.exports = mongoose.model('stream', StreamSchema)