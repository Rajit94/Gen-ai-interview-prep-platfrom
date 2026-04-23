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

            // If no session token exists, we can render guest routes immediately.
            // Legacy cookie cleanup can run in background without blocking UI.
            if (!token) {
                setUser(null)
                setLoading(false)

                logout().catch(() => {
                    // Ignore cleanup failures; user remains unauthenticated.
                })
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
