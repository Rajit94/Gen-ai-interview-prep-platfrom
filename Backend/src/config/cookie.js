const isSecureCookie =
    process.env.NODE_ENV === "production" ||
    process.env.RENDER === "true" ||
    process.env.COOKIE_SECURE === "true"

const authCookieOptions = {
    httpOnly: true,
    secure: isSecureCookie,
    sameSite: isSecureCookie ? "None" : "Lax",
    maxAge: 24 * 60 * 60 * 1000
}

const clearAuthCookieOptions = {
    httpOnly: authCookieOptions.httpOnly,
    secure: authCookieOptions.secure,
    sameSite: authCookieOptions.sameSite
}

module.exports = {
    authCookieOptions,
    clearAuthCookieOptions
}
