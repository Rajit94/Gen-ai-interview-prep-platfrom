import { useContext } from "react";
import { AuthContext } from "../auth.context-value";
import { login, register, logout } from "../services/auth.api";
import { removeAuthToken, setAuthToken } from "../services/token";



export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context


    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            setAuthToken(data.token)
            setUser(data.user)
            return data.user
        } catch (err) {
            removeAuthToken()
            setUser(null)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            setAuthToken(data.token)
            setUser(data.user)
            return data.user
        } catch (err) {
            removeAuthToken()
            setUser(null)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            removeAuthToken()
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    return { user, loading, handleRegister, handleLogin, handleLogout }
}
