const mongoose = require('mongoose')
const Schema = mongoose.Schema

/* Board ie. CBSE, HSS etc 
- name: ""
- classes: []
- timestamp
*/


const BoardSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        classes: [{
            type: mongoose.Types.ObjectId,
            ref: 'class'
        }],
        slug: {
            type: String,
            required: true,
            unique: true
        },
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

module.exports = mongoose.model('board', BoardSchema)