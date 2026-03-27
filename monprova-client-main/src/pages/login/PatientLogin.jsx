import React, { useContext, useState } from 'react';
import Button from '../../components/Button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../../providers/AuthProvider';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import useUser from '../../hooks/useUser';
import Swal from 'sweetalert2';
import Logo from '../../components/Logo';
const PatientLogin = () => {
    const [error, setError] = useState("");
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location?.state?.from?.pathname || "/dashboardPatient"
    const { signInEmail, signInWithGoogle } = useContext(AuthContext);
    const [users] = useUser();

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithGoogle();
            const googleUser = result.user;

            // ✅ Google users are already verified
            const patient = {
                email: result.user?.email,
                name: result.user?.displayName,
                role: "patient",  // default role for a patient
                createdAt: new Date(),
            }

            const response = await axiosPublic.post('/api/register', patient);
            if (response) {
                setError("");
                navigate(from, { replace: true });
            }
        } catch (err) {
            setError("গুগল দিয়ে লগইন করা যায়নি");
            console.error(err.message);
        }
    };

 const handleLogin = (event) => {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;
    
    // Check if the email exists in the user list
    const dbUser = users?.find(user => user.email === email);

    console.log('Email:', email);
    console.log('Password:', password);

    Swal.fire({
        title: "লগইন হচ্ছে...",
        text: "অনুগ্রহ করে অপেক্ষা করুন",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
    });

    if (dbUser) {
        // If the user is a patient, proceed with login
        if (dbUser?.role === "patient") {
            signInEmail(email, password)
                .then(result => {
                    const loggedUser = result.user;
                    if (loggedUser.emailVerified) {
                        setError(""); // Clear any previous error
                        navigate(from, { replace: true }); // Redirect to the patient dashboard
                        Swal.close(); // Close the loading dialog
                    } else {
                        setError("ইমেইল ভেরিফিকেশন করুন"); // Show email verification message
                        Swal.close(); // Close the loading dialog
                    }
                })
                .catch(error => {
                    setError("ভুল ইমেইল বা পাসওয়ার্ড দিয়েছেন"); // Incorrect email or password
                    Swal.close(); // Close the loading dialog
                });
        } 
        // If the user is a doctor, show error message
        else if (dbUser?.role === "doctor") {
            setError("ডাক্তারের ইমেইল ব্যবহার করছেন। দয়া করে ডাক্তার লগইন পেজে যান।");
            Swal.close(); // Close the loading dialog
        } else {
            setError("অপরিচিত ব্যবহারকারী। দয়া করে সঠিক লগইন পদ্ধতি ব্যবহার করুন।");
            Swal.close(); // Close the loading dialog
        }
    } else {
        setError("ইমেইল খুঁজে পাওয়া যায়নি। দয়া করে সঠিক ইমেইল দিন।");
        Swal.close(); // Close the loading dialog
    }
};



    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-8">
                <Logo />
            </div>
            <Helmet>
                <title>Patient Login</title>
            </Helmet>
            <div className="w-full max-w-6xl bg-base-100 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                {/* Left Section */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold mb-2">মনপ্রভায় স্বাগতম</h2>
                    <p className="text-sm text-gray-500 mb-8">
                        একজন রোগী হিসেবে প্রবেশ করুন।
                    </p>


                    <form onSubmit={handleLogin}>
                        {
                            error && <p className='text-red-600 text-sm mb-2'>** {error} **</p>
                        }
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

                        <input type="submit" value="লগইন করুন" className="btn bg-secondary-color text-white w-full px-8" />
                    </form>



                    <div className="divider">অথবা</div>


                    <button onClick={handleGoogleLogin} className="btn btn-outline w-full flex gap-2 border-2 border-primary-color text-gray-700 py-4">
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                            className="w-5 h-5 "
                        />
                        গুগল দিয়ে শুরু করুন
                    </button>


                    <p className="text-sm text-center mt-6">
                        আপনার কি কোনো আকাউন্ট নেই?{" "}
                        <Link to="/patientRegister" className="tertiary-color font-bold">
                            <a href="" className="tertiary-color font-bold">
                                সাইন আপ করুন
                            </a>
                        </Link>
                    </p>

                    <p className="text-sm text-center mt-6">
                        আপনি যদি একজন ডাক্তার হয়ে থাকেন?{" "}
                        <Link to="/doctorLogin" className="tertiary-color font-bold">
                            <a href="" className="tertiary-color font-bold">
                                লগইন করুন
                            </a>
                        </Link>
                    </p>
                </div>


                {/* Right Section */}
                <div className="relative hidden md:block">
                    <img
                        src="https://i.ibb.co.com/fdXsrqkY/cheerful-middle-aged-man-spreading-hands-park.jpg"
                        alt="HR"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30"></div>


                    {/* <div className="relative z-10 p-10 text-white flex flex-col justify-end h-full">
                        <div className="badge badge-primary mb-4">Be Confidently</div>
                        <h3 className="text-2xl font-semibold mb-2">
                            Streamline Your HR Tasks
                        </h3>
                        <p className="text-sm max-w-sm">
                            Unlock the power of our advanced HR Dashboard. Effortlessly oversee
                            every aspect of your team’s progress and monitor key performance
                            indicators with ease.
                        </p>
                    </div> */}
                </div>
            </div>
        </div>
    );
}


export default PatientLogin;