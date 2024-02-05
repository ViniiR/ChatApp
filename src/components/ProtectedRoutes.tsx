import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoutes() {
    const isValidToken = false; // check if http cookie jwt is valid, if yes then allow user to enter chat
    return (
        isValidToken 
        ? 
        <Outlet></Outlet>
        : 
        <Navigate to='/login'></Navigate>
    );
}

export default ProtectedRoutes;