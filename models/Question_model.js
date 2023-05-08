const mongoose = require('mongoose')
const Schema = mongoose.Schema

/* Question 
- question: ""
- questionMeta: ""
- answers: []
- explanation: ""
- explanationMeta: "" 
*/

const QuestionSchema = new Schema(
    {
        question: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true
        },
        slabSlug: {
            type: String,
            required: true,
            // unique: true
        },
        questionMeta: {
            imageUrl: { type: String },
            imageKey: { type: String }, //TODO: remove later
            // list: { type: Array },
            list: {
                type: Object,
                items: { type: Array },
                listType: { type: String, enum: ["1", "A", "a", "i"], default: "1" }
            },
            table: {
                type: Object,
                tableHead: [String],
                tableRows: [{
                    id: { type: String},
                    items: [String]
                }]
            },
            metaType: {
                type: String,
                enum: [ "", "table", "list", "image"],
                default: ""
            }
        },
        answers: [{
            optionIndex: { type: Number }, 
            option: { type: String, uppercase: true, required: true },
            text: { type: String, required: true },
            // correct: { type: Boolean },
        }],
        answer: {
            type: String,
            enum: ["A", "B", "C", "D", "E"],
            uppercase: true,
            required: true
        },
        explanation: {
            type: String,
        },
        explanationMeta: {
            imageUrl: { type: String },
            imageKey: { type: String }, 
            // list: { type: Array},
            list: {
                type: Object,
                items: { type: Array },
                listType: { type: String, enum: ["1", "A", "a", "i"], default: "1" }
            },
            table: {
                type: Object,
                tableHead: [String],
                tableRows: [{
                    id: { type: String },
                    items: [String]
                }]
            },
            metaType: {
                type: String,
                enum: [ "", "table", "list", "image"],
                default: ""
            }
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

module.exports = mongoose.model('question', QuestionSchema)