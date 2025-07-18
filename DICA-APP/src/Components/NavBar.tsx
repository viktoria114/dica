import { Outlet } from "react-router-dom";

export const NavBar = () => {
    return ( 
        <div>
            <p>ola soy la navbar</p>
            <Outlet />
        </div>
        
    );
}