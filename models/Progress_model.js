const mongoose = require('mongoose')
const Schema = mongoose.Schema
// const bcrypt = require('bcrypt')

/* 
- slab
- student
- subject
- correctQuestions
- wrongQuestions
- levels-3
- acuracy-0
- completion-0
- avgTimePerQuestion-0
- questionsAttended-0
*/
const ProgressSchema = new Schema(
    {
            slab: {
                type: mongoose.Types.ObjectId,
                required: true,
                ref: 'slab'
            },
            subscriptionId: {
                type: mongoose.Types.ObjectId,
                required: true,
                ref: 'subscription'
            },
            subject: {
                type: mongoose.Types.ObjectId,
                required: true,
                ref: 'subject'
            },
            correctQuestions: [{
                type: mongoose.Types.ObjectId,
                ref: 'question',
                // unique: true/* TODO: check */
            }],
            attemptedQuestions: [{
                type: mongoose.Types.ObjectId,
                ref: 'question',
                // unique: true,/* TODO: check */
            }],
            levels: {
                type: Number,
                default: 1
            },
            currentLevel: { 
                value: {
                    type: Number,
                    default: 1,
                },
                track_id: {
                    type: String
                },
                questions: [{
                    type: mongoose.Types.ObjectId,
                    ref: 'question',
                    // unique: true,/* TODO: check */
                }]
            },
            status: {
                type: String,
                enum: ['BRAINSTORM', 'CROWN', 'COMPLETED', 'UNTRACKED'],
                default: 'UNTRACKED'
            },
            completion: {type: Number, default: 0},
            accuracy: {type: Number, default: 0},
            avgTimePerQuestion: {type: Number, default: 0},
            questionsAttended: {type: Number, default: 0},
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('progress', ProgressSchema)