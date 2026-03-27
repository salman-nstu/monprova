import React, { useState, useContext } from "react";
import { AuthContext } from "../providers/AuthProvider";
import Swal from "sweetalert2"; // Import Swal
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";

const UpdatePassword = () => {
  const { updateUserPassword, user } = useContext(AuthContext); // Use current user
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPasswordError, setOldPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;

    // Reset all errors
    setError("");
    setOldPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");

    // Old password validation
    if (!oldPassword) {
      setOldPasswordError("পুরাতন পাসওয়ার্ড ফাঁকা থাকতে পারে না।");
      isValid = false;
    }

    // New password validation
    if (!newPassword) {
      setNewPasswordError("নতুন পাসওয়ার্ড ফাঁকা থাকতে পারে না।");
      isValid = false;
    } else {
      if (newPassword.length < 6) {
        setNewPasswordError("পাসওয়ার্ডে কমপক্ষে ৬টি ক্যারেক্টার থাকতে হবে।");
        isValid = false;
      } else if (/\s/.test(newPassword)) {
        setNewPasswordError("পাসওয়ার্ডে স্পেস থাকতে পারবে না।");
        isValid = false;
      } else {
        const passwordStrengthRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
        if (!passwordStrengthRegex.test(newPassword)) {
          setNewPasswordError(
            "পাসওয়ার্ডে কমপক্ষে একটি বড় হাতের অক্ষর, একটি ছোট হাতের অক্ষর, একটি সংখ্যা এবং একটি বিশেষ চিহ্ন থাকতে হবে।"
          );
          isValid = false;
        }
      }
    }

    // Confirm password validation
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("পাসওয়ার্ড মেলেনি!");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isValid = validateForm();
    if (!isValid) return;

    try {
      setLoading(true);

      // Step 1: Verify the old password
      if (!user) {
        setError("User is not logged in.");
        return;
      }

      // Try to sign in with the old password to validate it
      

      // Step 2: If old password is correct, proceed with updating the password
      await updateUserPassword(oldPassword, newPassword);

      Swal.fire({
        title: "পাসওয়ার্ড সফলভাবে আপডেট হয়েছে!",
        text: "আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। অনুগ্রহ করে পুনরায় লগইন করুন।",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/login"); // Redirect to login page
      });
    } catch (err) {
      setError("পুরানো পাসওয়ার্ড ভুল। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false); // Set loading to false after password update
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-center mb-6">পাসওয়ার্ড পরিবর্তন করুন</h2>

        {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
              পুরাতন পাসওয়ার্ড
            </label>
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="mt-2 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="পুরাতন পাসওয়ার্ড লিখুন"
            />
            {oldPasswordError && <div className="text-red-600 text-sm mt-1">{oldPasswordError}</div>}
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              নতুন পাসওয়ার্ড
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="mt-2 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="নতুন পাসওয়ার্ড লিখুন"
            />
            {newPasswordError && <div className="text-red-600 text-sm mt-1">{newPasswordError}</div>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              নতুন পাসওয়ার্ড নিশ্চিত করুন
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-2 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="পুনরায় নতুন পাসওয়ার্ড লিখুন"
            />
            {confirmPasswordError && <div className="text-red-600 text-sm mt-1">{confirmPasswordError}</div>}
          </div>

          <button
            type="submit"
            className={`w-full py-2 rounded-md text-white ${loading ? 'bg-gray-500' : 'bg-red-500 hover:bg-red-700'} transition`}
            disabled={loading}
          >
            {loading ? "পরিবর্তন হচ্ছে..." : "পাসওয়ার্ড পরিবর্তন করুন"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
