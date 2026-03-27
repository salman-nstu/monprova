import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../../providers/AuthProvider';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import useUser from '../../hooks/useUser';
import Swal from 'sweetalert2';
import Logo from '../../components/Logo';
import HomeNavbar from '../../components/NavBar/HomeNavBar';

const Login = () => {
    const [error, setError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [roleError, setRoleError] = useState("");
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location?.state?.from?.pathname || "/dashboardPatient";
    const form2 = "/dashboardDoctor";
    const { signInEmail, signInWithGoogle } = useContext(AuthContext);
    const [users] = useUser();
    const [role, setRole] = useState(""); // Track role (doctor or patient)

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
                    setError("আপনার রোল মেলে না, দয়া করে সঠিক রোল দিন।");
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
            setError("গুগল দিয়ে লগইন করা যায়নি");
            console.error(err.message);
        }
    };

    // Handle login
  const handleLogin = (event) => {
    event.preventDefault();
    
    // Reset all error messages
    setError("");
    setEmailError("");
    setPasswordError("");
    setRoleError("");

    const form = event.target;
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    // ===== Validation =====
    let hasError = false;

    // Check if email is empty
    if (!email) {
        setEmailError("ইমেইল দিন");
        hasError = true;
    }
    // Check if email format is valid
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEmailError("সঠিক ইমেইল দিন");
        hasError = true;
    }

    // Check if password is empty
    if (!password) {
        setPasswordError("পাসওয়ার্ড দিন");
        hasError = true;
    }
    // Check if password meets basic criteria
    else if (password.length < 6) {
        setPasswordError("পাসওয়ার্ডে কমপক্ষে ৬টি ক্যারেক্টার থাকতে হবে");
        hasError = true;
    }

    // Ensure role is selected
    if (!role) {
        setRoleError("দয়া করে আপনার রোল (রোগী বা ডাক্তার) নির্বাচন করুন");
        hasError = true;
    }

    if (hasError) return;
    console.log(users)
    // Check if the email exists in the user list
    const dbUser = users?.find(user => user.email === email);

    Swal.fire({
        title: "লগইন হচ্ছে...",
        text: "অনুগ্রহ করে অপেক্ষা করুন",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
    });

    if (dbUser) {
        // If the role matches, proceed with login
        if (dbUser?.role === role) {
            signInEmail(email, password)
                .then(result => {
                    const loggedUser = result.user;
                    if (loggedUser.emailVerified) {
                        setError(""); // Clear any previous error
                        if (role === "doctor") {
                            navigate(form2, { replace: true });
                        } else {
                            navigate(from, { replace: true });
                        }
                        Swal.close();
                    } else {
                        setError("ইমেইল ভেরিফিকেশন করুন");
                        Swal.close();
                    }
                })
                .catch(error => {
                    setError("ভুল ইমেইল বা পাসওয়ার্ড দিয়েছেন");
                    Swal.close();
                });
        } else {
            setError("আপনার রোল মেলে না, দয়া করে সঠিক লগইন পদ্ধতি ব্যবহার করুন।");
            Swal.close();
        }
    } else {
        setError("ইমেইল খুঁজে পাওয়া যায়নি। দয়া করে সঠিক ইমেইল দিন।");
        Swal.close();
    }
};


    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
            <HomeNavbar></HomeNavbar>
            
            <div className="w-full max-w-6xl bg-base-100 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-2 overflow-hidden mt-8">
                {/* Left Section */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold mb-2">মনপ্রভায় স্বাগতম</h2>
                    <p className="text-sm text-gray-500 mb-8">
                        আপনার প্রোফাইল এ লগইন করুন।
                    </p>

                    {/* Role Selection */}
                    <form onSubmit={handleLogin}>
                        {error && <p className='text-red-600 text-sm mb-2'>** {error} **</p>}

                        <div className="form-control mb-4">
                            <label className="label">
                                <span className="label-text">ইমেইল দিন</span>
                            </label>
                            {emailError && <p className='text-red-600 text-xs mb-1'>** {emailError} **</p>}
                            <input
                                type="email"
                                name="email"
                                placeholder="আপনার ইমেইল লিখুন"
                                className={`input input-bordered w-full px-4 border bg-white ${emailError ? 'border-red-500' : ''}`}
                                onChange={() => setEmailError("")}
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="" className="block mb-2">কি অ্যাকাউন্টে লগইন করতে চান?</label>
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
                                <span className="label-text">পাসওয়ার্ড দিন</span>
                            </label>
                            {passwordError && <p className='text-red-600 text-xs mb-1'>** {passwordError} **</p>}
                            <input
                                type="password"
                                name="password"
                                placeholder="আপনার পাসওয়ার্ড লিখুন"
                                className={`input input-bordered w-full px-4 border bg-white ${passwordError ? 'border-red-500' : ''}`}
                                onChange={() => setPasswordError("")}
                            />

                            <p className='mt-2'><Link to={"/resetpassword"} className="text-blue-600 hover:underline ">পাসওয়ার্ড ভুলে গেছেন?</Link></p>
                        </div>
                        
                            
                        

                        <input type="submit" value="লগইন করুন" className="btn bg-secondary-color text-white w-full px-8" />
                    </form>

                    <div className="divider">অথবা</div>

                    <button onClick={handleGoogleLogin} className="btn btn-outline w-full flex gap-2 border-2 border-blue-400 text-gray-700 py-4">
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                            className="w-5 h-5 "
                        />
                        গুগল দিয়ে শুরু করুন
                    </button>

                    <p className="text-sm text-center mt-6">
                        আপনার কি কোনো আকাউন্ট নেই?{" "}
                        <Link to={"/signup"} className="text-blue-600 font-bold">
                            সাইন আপ করুন
                        </Link>
                    </p>
                </div>

                {/* Right Section */}
                <div className="relative hidden md:block">
                    <img
                        src="https://i.ibb.co.com/fdXsrqkY/cheerful-middle-aged-man-spreading-hands-park.jpg"
                        alt="Login"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30"></div>
                </div>
            </div>
        </div>
    );
};

export default Login;
