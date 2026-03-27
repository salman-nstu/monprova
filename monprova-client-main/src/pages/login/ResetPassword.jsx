import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Logo from "../../components/Logo";
import { AuthContext } from "../../providers/AuthProvider";

const ResetPassword = () => {
    const { resetPassword } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    // Validation function to check the email
    const validateForm = () => {
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = "ইমেইল দিন";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "সঠিক ইমেইল ঠিকানা দিন";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleReset = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                // Call resetPassword with email
                await resetPassword(email); // Assuming resetPassword is an async function
                
                // Success message after reset password email is sent
                Swal.fire({
                    icon: "success",
                    title: "পাসওয়ার্ড রিসেট ইমেইল পাঠানো হয়েছে",
                    text: "আপনার ইমেইল ইনবক্স চেক করুন",
                    confirmButtonText: "ঠিক আছে",
                    confirmButtonColor: "#1998df",
                }).then(() => {
                    navigate("/login"); // Redirect to login page after success
                });
            } catch (error) {
                // Handle error (e.g., email not found or server issue)
                Swal.fire({
                    icon: "error",
                    title: "ত্রুটি ঘটেছে",
                    text: error.message || "আপনার ইমেইল পাঠানো সম্ভব হয়নি",
                    confirmButtonText: "ঠিক আছে",
                    confirmButtonColor: "#1998df",
                });
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-xl rounded-xl w-full max-w-3xl grid grid-cols-1 md:grid-cols-1">

                {/* Left Side Reset Form */}
                <div className="flex flex-col justify-center items-center px-10 py-12 space-y-6">
                    <Logo />

                    <h1 className="text-2xl font-semibold text-gray-700">
                        পাসওয়ার্ড রিসেট করুন
                    </h1>

                    <form onSubmit={handleReset} className="space-y-4 w-full max-w-sm">
                        {/* Reset Email */}
                        <div>
                            <input
                                type="email"
                                placeholder="আপনার ইমেইল দিন"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full p-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[#1998df] ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1 text-left">{errors.email}</p>}
                        </div>

                        {/* Reset Button */}
                        <input type="submit" value="রিসেট করুন" className="btn bg-secondary-color text-white w-full px-8" />

                        <p className="text-sm text-center mt-4">
                            পাসওয়ার্ড মনে পড়ে গেছে?{" "}
                            <Link to="/login">
                                <span className="text-[#1998df] hover:underline">
                                    লগইন করুন
                                </span>
                            </Link>
                        </p>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default ResetPassword;
