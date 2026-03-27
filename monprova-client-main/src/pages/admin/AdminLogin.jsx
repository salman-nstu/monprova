import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useUser from "../../hooks/useUser";
import useAuth from "../../hooks/useAuth";
import { AuthContext } from "../../providers/AuthProvider";
import Swal from "sweetalert2";

const AdminLogin = () => {
  const { user } = useAuth();
  const [users] = useUser();
  const { signInEmail } = useContext(AuthContext);
  const [error, setError] = useState("");

  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboardAdmin";
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(""); // Reset previous error

    const form = event.target;
    const email = form.email.value.trim();
    const password = form.password.value;

    // ===== Validation =====
    if (!email) return setError("** ইমেইল দিন **");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setError("** সঠিক ইমেইল দিন **");

    if (!password) return setError("** পাসওয়ার্ড দিন **");
    if (password.length < 6) return setError("** পাসওয়ার্ডে কমপক্ষে ৬টি ক্যারেক্টার থাকতে হবে **");

    // Show loading alert
    Swal.fire({
      title: "লগইন হচ্ছে...",
      text: "অনুগ্রহ করে অপেক্ষা করুন",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // Check if user exists in your users list
      const dbUser = users?.find((u) => u.email === email);

      if (!dbUser) {
        setError("ইমেইল খুঁজে পাওয়া যায়নি। দয়া করে সঠিক ইমেইল দিন।");
        Swal.close();
        return;
      }

      if (dbUser.role !== "admin") {
        setError("আপনার রোল মেলে না, দয়া করে সঠিক লগইন পদ্ধতি ব্যবহার করুন।");
        Swal.close();
        return;
      }

      // Attempt login
      const result = await signInEmail(email, password);
      // Login successful
      setError("");
      Swal.close();
      navigate(from, { replace: true });

    } catch (err) {
      console.error(err);
      setError("ভুল ইমেইল বা পাসওয়ার্ড দিয়েছেন");
      Swal.close();
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#EFF7FE]">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md border">
        <h2 className="text-xl font-bold text-center mb-6">অ্যাডমিন লগইন</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              ইমেইল
            </label>
            <input
              type="email"
              name="email"
              placeholder="ইমেইল লিখুন"
              className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              পাসওয়ার্ড
            </label>
            <input
              type="password"
              name="password"
              placeholder="পাসওয়ার্ড লিখুন"
              className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>

          <input
            type="submit"
            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-700 transition"
            value="লগইন করুন"
          />
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
