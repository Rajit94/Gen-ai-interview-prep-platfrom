import React from "react"
import { Navigate } from "react-router"
import { useAuth } from "../hooks/useAuth"

const GuestOnly = ({ children }) => {
    const { loading, user } = useAuth()

    if (loading) {
        return (<main><h1>Loading...</h1></main>)
    }

    if (user) {
        return <Navigate to="/home" replace />
    }

    return children
}

export default GuestOnly
