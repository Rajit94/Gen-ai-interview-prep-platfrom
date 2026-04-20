const AUTH_TOKEN_KEY = "authToken"

export function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token) {
    if (!token) {
        removeAuthToken()
        return
    }

    localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function removeAuthToken() {
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
