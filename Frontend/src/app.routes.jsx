import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
import GuestOnly from "./features/auth/components/GuestOnly";
import AuthRedirect from "./features/auth/components/AuthRedirect";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/interview";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <AuthRedirect />
    },
    {
        path: "/login",
        element: <GuestOnly><Login /></GuestOnly>
    },
    {
        path: "/register",
        element: <GuestOnly><Register /></GuestOnly>
    },
    {
        path: "/home",
        element: <Protected><Home /></Protected>
    },
    {
        path:"/interview/:interviewId",
        element: <Protected><Interview /></Protected>
    }
])
