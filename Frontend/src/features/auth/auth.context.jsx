import { useEffect, useState } from "react";
import { AuthContext } from "./auth.context-value";
import { getMe } from "./services/auth.api";
import { removeAuthToken } from "./services/token";


export const AuthProvider = ({ children }) => { 

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getAndSetUser = async () => {
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

        getAndSetUser()
    }, [])


    return (
        <AuthContext.Provider value={{user,setUser,loading,setLoading}} >
            {children}
        </AuthContext.Provider>
    )

    
}
