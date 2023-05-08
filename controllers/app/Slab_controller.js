const { getProgress } = require('../../services/app/Progress_service')
const SlabService = require('../../services/app/Slab_service')
const Subscription = require('../../models/Subscription_model')
const ObjectIdMongo = require('mongoose').Types.ObjectId
const createError = require('http-errors')

/* 
- get slab id
- get progress based on slab id, 
	- if not present create a new progress 
- logic for level calculation
- calc of progress*/

const WISECOIN_COUNT_LEVEL = 15
const WISECOIN_COUNT_CROWN = 100

module.exports = {
	getSlab: async (req, res, next) => {
		try {
			const { slab_id, subscription_id } = req.query

			if (!slab_id) throw createError.BadRequest('Slab id is required!')
			if (!subscription_id) throw createError.BadRequest('Subscription id is required!')

			const slab = await SlabService.getSlab({ _id: slab_id, subscriptionId: subscription_id })

			res.send(slab)
		} catch (error) {
			next(error)
		}
	},

	getSlabQuestions: async (req, res, next) => {
		try {
			const { slab_id, subscription_id } = req.query

			if (!slab_id) throw createError.BadRequest('Slab id is required!')
			if (!subscription_id) throw createError.BadRequest('Subscription id is required!')

			const questions = await SlabService.getSlabQuestions({ _id: slab_id, subscriptionId: subscription_id })

			res.send(questions)
		} catch (error) {
			next(error)
		}
	},

	postQuestionEvaluation: async (req, res, next) => {
		try {
			/* req
				- wrong questions 
				- slabId
				- progressId
			 */
			/* TODO: validation */
			const { wrongQuestions, track_id } = req.body
			const { subscription_id, slab_id } = req.query

			if (!slab_id) throw createError.BadRequest('Slab id is required!')
			if (!subscription_id) throw createError.BadRequest('Subscription id is required!')
			if (!track_id) throw createError.BadRequest('Track id is required!')
			if (!wrongQuestions) throw createError.BadRequest('Wrong questions is required!')
			// if(!progressId) throw createError.BadRequest('Progress id is required!')

			let progress = await getProgress({/* _id: progressId,  */slab: slab_id, subscriptionId: subscription_id })
			const { slab } = await SlabService.getSlab({ _id: slab_id, subscriptionId: subscription_id })

			if (!progress || slab.questions.length === 0) {
				throw createError.BadRequest('No Questions on slab / progress does not exixts')
			}

			/* NOTE: to check whether evaluation for this set of qns */
			if (progress.currentLevel.track_id !== track_id) {
				throw createError.BadRequest('Invalid evaluation request, track_id does not match')
			}

			/* TODO: get subscription to update wisecoins and crowns */
			const progressLevel = {
				accuracy: 0,
				wiseCoins: WISECOIN_COUNT_LEVEL,
				crown: 0
			}
			const progressStatus = progress.status

			const subscription = await Subscription.findOne({ _id: progress.subscriptionId })

			/*
				NOTE:
				only do calculations if progress status is COMPLETED
			*/
			if (progress.status !== "COMPLETED") {

				if (progress.status !== "CROWN") {
					/* 
						NOTE:
						Do all calculations if not in crown level corwn has only random questions if all q are correct
					*/
					const questionIds = new Set(progress.currentLevel.questions.map(id => id.toString()))
					const wrongQuestionIds = new Set(wrongQuestions)

					const difference = (setA, setB) => {
						let _difference = new Set(setA)
						for (let elem of setB) {
							_difference.delete(elem)
						}
						return _difference
					}

					const correct_questions_level = difference(questionIds, wrongQuestionIds)
					const correctIds = new Set(progress.correctQuestions.map(id => id.toString()))
					const corrected_old_questions_slab = difference(correctIds, wrongQuestionIds)
					const correct_questions_slab = new Set([...corrected_old_questions_slab, ...correct_questions_level])

					const questions_attempted = new Set([
						...progress.attemptedQuestions.map(id => id.toString()),
						...progress.currentLevel.questions.map(id => id.toString())
					])
					/* 
						TODO: 
						- levels
						- avgQsec
					*/
					progress.correctQuestions = Array.from(correct_questions_slab)
					progress.attemptedQuestions = Array.from(questions_attempted)
					progress.questionsAttended = progress.attemptedQuestions.length
					progress.accuracy = Math.floor((progress.correctQuestions.length / (progress.questionsAttended)) * 100)
					progress.currentLevel = { value: progress.currentLevel.value, questions: [] }
				}

				const isCompleted = slab.questions?.length === progress.correctQuestions.length
				if (isCompleted) {
					if (progress.status === "BRAINSTORM" || progress.status === "UNTRACKED") {/* TODO: review */
						progress.status = "CROWN"
					} else if (progress.status === "CROWN" && (wrongQuestions.length === 0)) {
						progress.status = "COMPLETED"

						progressLevel.wiseCoins = WISECOIN_COUNT_CROWN
						progressLevel.crown = 1

						/* TODO: review - completion - 100% */
						progress.completion = 100

						/* TODO: add 1 crown to subscription */
						subscription.crowns = subscription.crowns + 1
					}
				} else {
					/* TODO: some error here do not increment levels if no err in qns or if only 10 qns are there */
					progress.currentLevel = { value: progress.currentLevel.value + 1, questions: [] }
					if (progress.currentLevel.value >= progress.levels) {
						progress.levels = progress.currentLevel.value
					}
					progress.status = "BRAINSTORM"

					/* TODO: review - progress.levels + 1 => + 1 for crown level */
					progress.completion = progress.currentLevel.value / (progress.levels + 1) * 100
				}


				/* NOTE: save progress changes */
				progress = await progress.save()
			}
			/*
				NOTE:
				END HERE: 
			*/

			const correctCount = 10 - wrongQuestions.length
			const levelAccuracy = Math.floor((correctCount / 10) * 100)
			progressLevel.accuracy = levelAccuracy

			/* 
				if completed wise coins = 100
				if brainstormin , 15 + Math.floor(accuracy / 10)
				else Math.floor(accuracy / 10)
			*/
			if (progressStatus === "COMPLETED" || (progressStatus === "CROWN" && correctCount !== 10)) {
				progressLevel.wiseCoins = Math.floor(levelAccuracy / 10)
			} else if (progressStatus === "BRAINSTORM" || progressStatus === "UNTRACKED") {
				progressLevel.wiseCoins += Math.floor(levelAccuracy / 10)
			}

			const weeklyCoin = {
				coins: progressLevel.wiseCoins,
				date: new Date()
			}
			subscription.wiseCoins.weeklyCoins.push(weeklyCoin)
			subscription.wiseCoins.totalCoins += progressLevel.wiseCoins
			await subscription.save()

			/* Response
				levelComplete: true
				wiseCoins: number
				accuracy: curretnLevel(perc)
			*/



			/* filter progress */
			progress = progress.toObject()
			delete progress.currentLevel.questions
			delete progress.correctQuestions
			delete progress.attemptedQuestions
			delete progress.__v

			res.send({ levelProgress: progressLevel, progress })
		} catch (error) {
			// console.log(error)
			next(error)
		}
	},

	getSuggestion: async (req, res, next) => {
		try {
			const { subject_id, subscription_id } = req.query

			if (!subscription_id) throw createError.BadRequest('Subscription id is required!')

			const topic = await SlabService.getSuggestedTopic({ subscriptionId: subscription_id, subjectId: subject_id })

			res.send(topic)
		} catch (error) {
			next(error)
		}
	}
}