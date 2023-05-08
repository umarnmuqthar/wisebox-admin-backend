module.exports = {
    verifyAdminRole: async (req, res, next) => {
        if (req.payload.role !== "admin") {
            const error = {
                message: "Admin access denied",
                status: 400
            }
            return res.status(error.status).json({ error });
        }
        next()
    },

    verifyTeacherRole: async (req, res, next) => {
        if (req.payload.role !== "teacher") {
            if (req.payload.role !== "admin") {
                const error = {
                    message: "Teacher access denied",
                    status: 400
                }
                return res.status(error.status).json({ error });
            }
        }
        next()
    },

    verifyAdminOrTeacherRole: async (req, res, next) => {
        if (req.payload.role !== "teacher") {
            if (req.payload.role !== "admin") {
                const error = {
                    message: "Access denied",
                    status: 400
                }
                return res.status(error.status).json({ error });
            }
        }
        next()
    },
}