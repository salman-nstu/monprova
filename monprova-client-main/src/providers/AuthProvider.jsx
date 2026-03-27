import { createContext, useEffect, useState } from "react";
import { getAuth, GoogleAuthProvider, sendPasswordResetEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { app } from "../firebase/firebase.config";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    signInWithPopup,
} from "firebase/auth";


import useAxiosPublic from "../hooks/useAxiosPublic";

export const AuthContext = createContext(null);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
    const [error, setError] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const axiosPublic = useAxiosPublic();

    // Email signup
    const signUpEmail = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    };

    // Email login
    const signInEmail = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    };

    // Google sign in / sign up
    const signInWithGoogle = () => {
        setLoading(true);
        return signInWithPopup(auth, googleProvider);
    };

    // Logout
    const logOut = () => {
        setLoading(true);
        return signOut(auth)
            .then(() => {
                // Clear localStorage if needed
                localStorage.removeItem("user"); // Optionally clear localStorage
                setUser(null); // Ensure user state is reset
                setLoading(false);
            })
            .catch((error) => {
                setError(error.message); // Handle error if any
                setLoading(false);
            });
    };

    const resetPassword = (email) => {
        setLoading(true);
        return sendPasswordResetEmail(auth, email);
    };

    // Update Password with old password validation
  

const updateUserPassword = async (oldPassword, newPassword) => {
    const user = auth.currentUser; // Get current authenticated user
    setLoading(true); // Start loading

    if (user) {
        try {
            // Step 1: Verify the old password by signing in
            await signInWithEmailAndPassword(auth, user.email, oldPassword); // Verify old password

            // Step 2: Reauthenticate the user to update the password (necessary in Firebase for certain actions)
            const credential = EmailAuthProvider.credential(user.email, oldPassword);
            await reauthenticateWithCredential(user, credential); // Reauthenticate

            // Step 3: Update the password
            await updatePassword(user, newPassword); // Update with new password
            
            setError(""); // Clear any previous errors
            setLoading(false); // End loading
            return { message: "Password updated successfully!" }; // Return success message
        } catch (error) {
            setError("Incorrect old password. Please try again.");
            setLoading(false); // End loading
            throw new Error(error.message); // Throw error if something goes wrong
        }
    } else {
        setError("No user is logged in.");
        setLoading(false); // End loading
        throw new Error("No user is logged in."); // Handle case where user is not logged in
    }
};


    // Auth state observer
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const userInfo = { email: currentUser.email };
                axiosPublic.post("/api/jwt", userInfo).then((res) => {
                    if (res.data.token) {
                        localStorage.setItem("access-token", res.data.token);
                    }
                });
            } else {
                localStorage.removeItem("access-token");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const authInfo = {
        user,
        loading,
        signUpEmail,
        signInEmail,
        signInWithGoogle,
        logOut,
        error,
        setError,
        resetPassword,
        updateUserPassword, // Expose updateUserPassword to the context
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
