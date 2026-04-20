const defaultOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

const configuredOrigins = (process.env.CLIENT_URL || process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

const allowedOrigins = [ ...defaultOrigins, ...configuredOrigins ]

const corsOptions = {
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
            return
        }

        callback(new Error(`Origin ${origin} is not allowed by CORS`))
    },
    credentials: true
}

module.exports = corsOptions
