import { Link, useLocation, useNavigate } from "react-router-dom";
import { patientMenuItems, doctorMenuItems, adminMenuItems } from "../../dashboardMenus.jsx";
import { useContext, useState } from "react";
import { AuthContext } from "../../providers/AuthProvider.jsx";
import Logo from "../Logo.jsx";
import useAuth from "../../hooks/useAuth.jsx";
import usePatient from "../../hooks/usePatient.jsx";
import useDoctor from "../../hooks/useDoctor.jsx";
import { GrUpdate } from "react-icons/gr";
import { MdVerified } from "react-icons/md";
import useAdmin from "../../hooks/useAdmin.jsx";

const DashboardNavBar = ({ fullName, role }) => {
    const { user } = useAuth();
    const [patients] = usePatient();
    const [doctors] = useDoctor();
    const [admins] = useAdmin();
    const admin = admins?.find(admin => admin.email === user.email)
    const patient = patients.find(p => p.email === user?.email);
    const doctor = doctors.find(d => d.email === user?.email);
    const displayNames = role === "patient" ? patient?.name : role === "doctor" ? doctor?.name : admin?.name || "Admin";
    const displayImg = role === "patient" ? patient?.image : role === "doctor" ? doctor?.image : admin?.image;

    const { logOut } = useContext(AuthContext)
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logOut();

        if (role === "doctor") {
            navigate("/login", { replace: true });
        } else if (role === "admin") {
            navigate("/admin", { replace: true });
        } else {
            navigate("/login", { replace: true });
        }
    };

    const getChangePasswordRoute = (role) => {
        if (role === "admin") return "/dashboardAdmin/change-password";
        if (role === "doctor") return "/dashboardDoctor/change-password";
        if (role === "patient") return "/dashboardPatient/change-password";
        return "/";
    };




    const menuItems =
        role === "admin" ? adminMenuItems
            : role === "doctor" ? doctorMenuItems
                : patientMenuItems;

    return (
        <aside className="w-1/5 bg-white xm:hidden sm:hidden md:block shadow-lg p-6 fixed h-full overflow-y-auto">

            <div className="flex flex-col items-center mb-4 ">
                <div className="relative">
                    {role === "doctor" && (
                        <p className={`absolute -top-1 right-4 ${doctor?.verificationStatus === "verified" ? "text-green-500" : doctor?.verificationStatus === "not-verified" ? "text-gray-500" : doctor?.verificationStatus === "pending" ? "text-yellow-500" : doctor?.verificationStatus === "rejected" ? "text-red-500" : "text-gray-500"} text-4xl bg-white rounded-full`}>
                            <MdVerified />
                        </p>
                    )}
                </div>

                <img src={displayImg} alt="" className="w-20 h-20 rounded-full object-cover border-2 p-1" />
                <div className="mt-2">
                    <p className="font-semibold text-center">{displayNames}</p>
                    <p className="text-center text-red-500 text-sm"> {role === "admin" ? "অ্যাডমিন ড্যাশবোর্ড"
                        : role === "doctor" ? "ডাক্তারের ড্যাশবোর্ড"
                            : "রোগীর ড্যাশবোর্ড"}</p>
                </div>
            </div>


            <ul className="space-y-4">
                {menuItems.map((item, index) => {
                    const isActive = location.pathname === item.link;

                    // 🔴 Logout item
                    if (item.isLogout) {
                        return (
                            <li key={index} className="border rounded-md">
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-6 px-4 py-2 text-md font-semibold
                        rounded-md text-red-600 hover:bg-red-600 hover:text-white transition"
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.title}</span>
                                </button>
                            </li>
                        );
                    }

                    // 🟢 Normal menu item
                    return (
                        <li key={index} className="border rounded-md">
                            <Link
                                to={item.link}
                                className={`flex items-center gap-6 px-4 py-2 text-md font-semibold rounded-md transition
                    ${isActive
                                        ? "bg-blue-500 text-white"
                                        : "hover:bg-blue-600 hover:text-white"
                                    }`}
                            >
                                <span>{item.icon}</span>
                                <span>{item.title}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
            {
                <div className="flex justify-center mt-4">
                    <Link
                        to={getChangePasswordRoute(role)}
                        className="inline-flex items-center gap-2
                   bg-gray-500 hover:bg-primary-400
                   text-white px-4 py-2 rounded-lg w-full"
                    >
                        <p className="text-sm inline-flex items-center gap-2"> <GrUpdate /> পাসওয়ার্ড পরিবর্তন করুন</p>
                    </Link>
                </div>

            }



        </aside>
    );
};

export default DashboardNavBar;
