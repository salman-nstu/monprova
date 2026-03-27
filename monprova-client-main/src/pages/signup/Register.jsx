import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../../providers/AuthProvider';
import { sendEmailVerification } from 'firebase/auth';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import Logo from '../../components/Logo';
import HomeNavbar from '../../components/NavBar/HomeNavBar';
import useUser from '../../hooks/useUser';

const Register = () => {
    const axiosPublic = useAxiosPublic();
    const [error, setError] = useState("");
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [roleError, setRoleError] = useState("");
    const [role, setRole] = useState("");
    const [users] = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location?.state?.from?.pathname || "/dashboardPatient";
    const form2 = "/dashboardDoctor";
    const { signUpEmail, signInWithGoogle } = useContext(AuthContext);

    // Handle Google Login
    const handleGoogleLogin = async () => {
        setRoleError("");
        setError("");
        if (!role) return setRoleError("দয়া করে আপনার রোল (রোগী বা ডাক্তার) নির্বাচন করুন");
        try {

            const result = await signInWithGoogle();
            const googleUser = result.user;
            const dbUser = users?.find(user => user.email === googleUser?.email);
            if (dbUser) {
                if (dbUser.role !== role) {
                    setError("আপনার রোল মেলে না, দয়া করে সঠিক রোল দিন।");
                    return;
                }
                else {
                    setError("");
                    if (role === "doctor") {
                        navigate(form2, { replace: true });
                    } else {
                        navigate(from, { replace: true });
                    }
                }
            }
            else {
                const user = {
                    email: result.user?.email,
                    name: result.user?.displayName,
                    role,  // Use the selected role
                    createdAt: new Date(),
                }

                const response = await axiosPublic.post('/api/register', user);
                if (response) {
                    setError("");
                    if (role === "doctor") {
                        navigate(form2, { replace: true });
                    } else {
                        navigate(from, { replace: true });
                    }
                }
            }

            // Register Google user with role (doctor or patient based on selection)

        } catch (err) {
            setError("গুগল দিয়ে লগইন করা যায়নি");
            console.error(err.message);
        }
    };

    // Handle registration
    const handleSignUp = async (event) => {
        event.preventDefault();
        
        // Reset all error messages
        setError("");
        setNameError("");
        setEmailError("");
        setPasswordError("");
        setRoleError("");

        const form = event.target;
        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const password = form.password.value;

        // ===== Validation =====
        let hasError = false;

        if (!name) {
            setNameError("আপনার নাম দিন");
            hasError = true;
        }

        if (!email) {
            setEmailError("ইমেইল দিন");
            hasError = true;
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setEmailError("আপনার সঠিক ইমেইল দিন");
                hasError = true;
            }
        }

        if (!password) {
            setPasswordError("পাসওয়ার্ড দিন");
            hasError = true;
        } else if (password.length < 6) {
            setPasswordError("কমপক্ষে ৬ সংখ্যার পাসওয়ার্ড দিন");
            hasError = true;
        } else {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
            if (!passwordRegex.test(password)) {
                setPasswordError("পাসওয়ার্ডে আপার, লোয়ার, সংখ্যা ও বিশেষ চিহ্ন থাকতে হবে");
                hasError = true;
            }
        }

        if (!role) {
            setRoleError("দয়া করে আপনার রোল (রোগী বা ডাক্তার) নির্বাচন করুন");
            hasError = true;
        }

        if (hasError) return;

        // Create user profile
        const user = {
            name,
            email,
            role,  // dynamically set role (doctor or patient)
        };

        try {
            // Save to MongoDB
            const response = await axiosPublic.post('/api/register', user);
            console.log(`${role.charAt(0).toUpperCase() + role.slice(1)} registered:`, response.data);

            // Firebase Signup
            const result = await signUpEmail(email, password);
            const firebaseUser = result.user;

            // Send Email Verification
            await sendEmailVerification(firebaseUser);

            Swal.fire({
                title: "রেজিস্ট্রেশন সফল",
                text: "ভেরিফিকেশন ইমেইল পাঠানো হয়েছে",
                icon: "success",
                confirmButtonText: "OK",
            }).then(() => {
                navigate("/login");
            });
        } catch (err) {
            console.error("Error during registration:", err.message);
            setError("রেজিস্ট্রেশন ব্যর্থ হয়েছে: " + err.message);
        }
    };

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
            <HomeNavbar></HomeNavbar>
           
            <div className="w-full max-w-6xl bg-base-100 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                {/* Left Section */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold mb-2">মনপ্রভায় স্বাগতম</h2>
                    <p className="text-sm text-gray-500 mb-8">এখানে সাইন আপ করুন</p>

                    {/* Role Selector with Radio Buttons */}
                    <form onSubmit={handleSignUp}>
                        {error && <p className="text-red-600 text-sm mb-2">** {error} **</p>}
                        <div className="form-control mb-4">
                            <label className="label">
                                <span className="label-text">নাম দিন</span>
                            </label>
                            {nameError && <p className='text-red-600 text-xs mb-1'>** {nameError} **</p>}
                            <input
                                name="name"
                                type="text"
                                placeholder="আপনার নাম লিখুন"
                                className={`input input-bordered border w-full px-4 bg-white ${nameError ? 'border-red-500' : ''}`}
                                onChange={() => setNameError("")}
                            />
                        </div>

                        <div className="form-control mb-4">
                            <label className="label">
                                <span className="label-text">ইমেইল দিন</span>
                            </label>
                            {emailError && <p className='text-red-600 text-xs mb-1'>** {emailError} **</p>}
                            <input
                                type="email"
                                name="email"
                                placeholder="আপনার ইমেইল লিখুন"
                                className={`input input-bordered border w-full px-4 bg-white ${emailError ? 'border-red-500' : ''}`}
                                onChange={() => setEmailError("")}
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="" className="block mb-2">কোন ধরণের অ্যাকাউন্ট খুলতে চান?</label>
                            {roleError && <p className='text-red-600 text-xs mb-1'>** {roleError} **</p>}
                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="patient"
                                        checked={role === "patient"}
                                        onChange={() => { setRole("patient"); setRoleError(""); }}
                                        className="radio text-blue-500 border-2"
                                    />
                                    <span className="ml-2">রোগী</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="doctor"
                                        checked={role === "doctor"}
                                        onChange={() => { setRole("doctor"); setRoleError(""); }}
                                        className="radio text-blue-500 border-2"
                                    />
                                    <span className="ml-2">ডাক্তার</span>
                                </label>
                            </div>
                        </div>

                        <div className="form-control mb-6">
                            <label className="label">
                                <span className="label-text">পাসওয়ার্ড দিন</span>
                            </label>
                            {passwordError && <p className='text-red-600 text-xs mb-1'>** {passwordError} **</p>}
                            <input
                                type="password"
                                name="password"
                                placeholder="আপনার পাসওয়ার্ড লিখুন"
                                className={`input input-bordered border w-full px-4 bg-white ${passwordError ? 'border-red-500' : ''}`}
                                onChange={() => setPasswordError("")}
                            />
                        </div>

                        <input type="submit" value="সাইন আপ করুন" className="btn bg-secondary-color text-white w-full px-8" />
                    </form>

                    <div className="divider">অথবা</div>

                    <button onClick={handleGoogleLogin} className="btn btn-outline w-full flex gap-2 border-2 border-blue-400 text-gray-700 py-4">
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                            className="w-5 h-5"
                        />
                        গুগল দিয়ে শুরু করুন
                    </button>

                    <p className="text-sm text-center mt-6">
                        আপনার কি কোনো অ্যাকাউন্ট আছে?{" "}
                        <Link to={"/login"} className="text-blue-600 font-bold">
                            লগইন করুন
                        </Link>
                    </p>
                </div>

                {/* Right Section */}
                <div className="relative hidden md:block">
                    <img
                        src="https://i.ibb.co.com/whH9DckW/portrait-male-doctor-patient.jpg"
                        alt="Doctor/Patient"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30"></div>
                </div>
            </div>
        </div>
    );
};

export default Register;
