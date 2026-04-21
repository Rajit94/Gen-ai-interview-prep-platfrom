const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")


function getTokenFromRequest(req) {
    const authHeader = req.headers.authorization || ""
    const bearerToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : null

    return (
        bearerToken ||
        req.headers["x-auth-token"] ||
        req.body?.token ||
        req.query?.token ||
        null
    )
}

async function authUser(req, res, next) {

    const token = getTokenFromRequest(req)

    if (!token) {
        return res.status(401).json({
            message: "Token not provided.",
            received: {
                cookie: Boolean(req.cookies?.token),
                authorization: Boolean(req.headers.authorization),
                xAuthToken: Boolean(req.headers["x-auth-token"])
            }
        })
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({
        token
    })

    if (isTokenBlacklisted) {
        return res.status(401).json({
            message: "token is invalid"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded
        next()
    } catch (err) {

        return res.status(401).json({
            message: "Invalid token."
        })
    }

}
module.exports = { authUser, getTokenFromRequest }
