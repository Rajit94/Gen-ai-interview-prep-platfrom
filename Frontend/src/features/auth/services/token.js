const AUTH_TOKEN_KEY = "authToken"

export function getAuthToken() {
    return sessionStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token) {
    if (!token) {
        removeAuthToken()
        return
    }

    sessionStorage.setItem(AUTH_TOKEN_KEY, token)
    // Cleanup legacy token storage so old sessions do not auto-login.
    localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function removeAuthToken() {
    sessionStorage.removeItem(AUTH_TOKEN_KEY)
    // Cleanup legacy token storage so logout works regardless of old storage mode.
    localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function applyAuthHeader(config) {
    const token = getAuthToken()

    if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
}

export function getAuthHeaders(headers = {}) {
    const token = getAuthToken()

    if (!token) {
        return headers
    }

    return {
        ...headers,
        Authorization: `Bearer ${token}`
    }
}
