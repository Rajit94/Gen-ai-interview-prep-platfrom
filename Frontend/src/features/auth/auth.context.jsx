import { useEffect, useState } from "react";
import { AuthContext } from "./auth.context-value";
import { getMe, logout } from "./services/auth.api";
import { getAuthToken, removeAuthToken } from "./services/token";


export const AuthProvider = ({ children }) => { 

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const bootstrapAuth = async () => {
            const token = getAuthToken()

            // One-time cleanup path: if we have no session token,
            // clear any legacy auth cookie from older deployments.
            if (!token) {
                try {
                    await logout()
                } catch {
                    // Ignore cleanup failures; user remains unauthenticated.
                } finally {
                    setUser(null)
                    setLoading(false)
                }
                return
            }

            try {
                const data = await getMe()
                setUser(data.user)
            } catch {
                removeAuthToken()
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        bootstrapAuth()
    }, [])


    return (
        <AuthContext.Provider value={{user,setUser,loading,setLoading}} >
            {children}
        </AuthContext.Provider>
    )

    
}
