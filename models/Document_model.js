const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DocumentSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        keywords: {
            type: String,
            required: true,
        },
        noIndex: {
            type: Boolean,
            default: true,
        },
        page_content: {
            type: String,
            required: true
        },
        slug: {
            type: String,
            required: true
        },
    }, 
    {
        timestamps: true
    }
)

module.exports = mongoose.model('template', DocumentSchema)