import { Outlet } from "react-router-dom";
import Home from "../pages/home/home/Home";

const MainLayout = () => {
    return (
        <div>
            <Outlet></Outlet>
        </div>
    );
};

export default MainLayout;