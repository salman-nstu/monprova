import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../../providers/AuthProvider';
import { sendEmailVerification } from 'firebase/auth';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import Logo from '../../components/Logo';

const DoctorRegister = () => {
    const axiosPublic = useAxiosPublic();
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const from = location?.state?.from?.pathname || "/dashboardPatient";
    const { signUpEmail, signInWithGoogle } = useContext(AuthContext);

    // Handle Google Login
    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithGoogle();
            const googleUser = result.user;
            const doctor = {
                email: result.user?.email,
                name: result.user?.displayName,
                role: "doctor",  // default role for a patient

            }

            const response = await axiosPublic.post('/api/register', doctor);
            // ✅ Google users are already verified
            if (response) {
                navigate(from, { replace: true });
            }
        } catch (err) {
            setError("গুগল দিয়ে লগইন করা যায়নি");
            console.error(err.message);
        }
    };

    // Handle patient registration
    const handleSignUp = async (event) => {
        event.preventDefault();
        setError("");  // Reset error message

        const form = event.target;
        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const password = form.password.value;

        // ===== Validation =====
        if (!name) return setError("আপনার নাম দিন");

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return setError("আপনার সঠিক ইমেইল দিন");

        if (password.length < 6) return setError("কমপক্ষে ৬ সংখ্যার পাসওয়ার্ড দিন");

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
        if (!passwordRegex.test(password)) return setError("পাসওয়ার্ডে আপার, লোয়ার, সংখ্যা ও বিশেষ চিহ্ন থাকতে হবে");

        // ===== Patient profile (NO PASSWORD) =====
        const doctor = {
            name,
            email,
            role: "doctor",  // default role for a patient
            createdAt: new Date(),
        };

        try {
            /* ========================== */
            /* 1️⃣ Save to MongoDB FIRST */
            /* ========================== */
            const response = await axiosPublic.post('/api/register', doctor);
            console.log('Doctor registered:', response.data);

            /* ========================== */
            /* 2️⃣ Firebase Signup SECOND */
            /* ========================== */
            const result = await signUpEmail(email, password);
            const user = result.user;

            // Send Email Verification
            await sendEmailVerification(user);

            /* ========================== */
            /* ✅ SUCCESS */
            /* ========================== */
            Swal.fire({
                title: "রেজিস্ট্রেশন সফল",
                text: "ভেরিফিকেশন ইমেইল পাঠানো হয়েছে",
                icon: "success",
                confirmButtonText: "OK",
            }).then(() => {
                navigate("/doctorLogin");
            });

        } catch (err) {
            console.error("Error during registration:", err.message);
            setError("রেজিস্ট্রেশন ব্যর্থ হয়েছে: " + err.message);
        }
    };

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-8">
                <Logo />
            </div>

            <Helmet>
                <title>Doctor Register</title>
            </Helmet>
            <div className="w-full max-w-6xl bg-base-100 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                {/* Left Section */}

                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold mb-2">মনপ্রভায় স্বাগতম</h2>
                    <p className="text-sm text-gray-500 mb-8">
                        একজন ডাক্তার হিসেবে শুরু করুন।
                    </p>

                    <form onSubmit={handleSignUp}>
                        {error && <p className="text-red-600 text-sm mb-2">** {error} **</p>}
                        <div className="form-control mb-4">
                            <label className="label">
                                <span className="label-text">নাম দিন</span>
                            </label>
                            <input
                                name="name"
                                type="text"
                                placeholder="আপনার নাম লিখুন"
                                className="input input-bordered w-full px-4 bg-gray-200"
                            />
                        </div>

                        <div className="form-control mb-4">
                            <label className="label">
                                <span className="label-text">ইমেইল দিন</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="আপনার ইমেইল লিখুন"
                                className="input input-bordered w-full px-4 bg-gray-200"
                            />
                        </div>

                        <div className="form-control mb-6">
                            <label className="label">
                                <span className="label-text">পাসওয়ার্ড দিন</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="আপনার পাসওয়ার্ড লিখুন"
                                className="input input-bordered w-full px-4 bg-gray-200"
                            />
                        </div>

                        <input type="submit" value="সাইন আপ করুন" className="btn bg-secondary-color text-white w-full px-8" />
                    </form>

                    <div className="divider">অথবা</div>

                    <button onClick={handleGoogleLogin} className="btn btn-outline w-full flex gap-2 border-2 border-primary-color text-gray-700 py-4">
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                            className="w-5 h-5"
                        />
                        গুগল দিয়ে শুরু করুন
                    </button>

                    <p className="text-sm text-center mt-6">
                        আপনার কি কোনো আকাউন্ট আছে?{" "}
                        <Link to="/doctorLogin" className="tertiary-color font-bold">
                            লগইন করুন
                        </Link>
                    </p>

                    <p className="text-sm text-center mt-6">
                        আপনি যদি একজন রোগী হয়ে থাকেন?{" "}
                        <Link to="/patientRegister" className="tertiary-color font-bold">
                            সাইন আপ করুন
                        </Link>
                    </p>
                </div>

                {/* Right Section */}
                <div className="relative hidden md:block">
                    <img
                        src="https://i.ibb.co.com/whH9DckW/portrait-male-doctor-patient.jpg"
                        alt="Doctor"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30"></div>
                </div>
            </div>
        </div>
    );
};

export default DoctorRegister;
