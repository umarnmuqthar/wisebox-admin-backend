const createError = require('http-errors')
const SubjectService = require('../../services/app/Subject_service')
//models
const Subject = require('../../models/Subject_model')

module.exports = {
    getSubject: async (req, res, next) => {
        try {
            const {subject_id, subscription_id} = req.query
            
            /*TODO: validate */
            if(!subject_id) throw createError.BadRequest('Subject id is required!')
            if(!subscription_id) throw createError.BadRequest('Subscription id is required!')
            
            const subject = await SubjectService.getSubject({_id: subject_id, subscriptionId: subscription_id})
            
            res.send(subject)

        } catch(err) {
            next(err)
        }
    },
}