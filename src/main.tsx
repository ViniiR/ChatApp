import ReactDOM from "react-dom/client";
import {
    createHashRouter,
    Navigate,
    RouterProvider,
} from "react-router-dom";
import Login from "./components/Login";
import ProtectedRoutes from "./components/ProtectedRoutes";
import Chat from "./components/Chat";
import SignUp from "./components/SignUp";

//hash is not recommended but it is what it is
const router = createHashRouter([
    {
        path: "/",
        element: <Navigate to={"/auth"}></Navigate>,
    },
    {
        path: "/auth",
        element: <ProtectedRoutes></ProtectedRoutes>,
        children: [
            {
                path: "/auth",
                element: <Navigate to={"/auth/chat"}></Navigate>,
            },
            {
                path: "/auth/chat",
                element: <Chat></Chat>,
            },
        ],
    },
    {
        path: "/login",
        element: <Login></Login>,
    },
    {
        path: "/signup",
        element: <SignUp></SignUp>,
    },
    {
        path: '*'
        
    }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <RouterProvider router={router}></RouterProvider>
);
