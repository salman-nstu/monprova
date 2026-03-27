const fs = require('fs');
let content = fs.readFileSync('src/pages/signup/Register.jsx', 'utf8');

// Replace the validation logic
const oldValidation = `    // Handle registration
    const handleSignUp = async (event) => {
        event.preventDefault();
        setError("");  // Reset error message

        const form = event.target;
        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const password = form.password.value;

        // ===== Validation =====
        if (!name) return setError("আপনার নাম দিন");

        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailRegex.test(email)) return setError("আপনার সঠিক ইমেইল দিন");

        if (password.length < 6) return setError("কমপক্ষে ৬ সংখ্যার পাসওয়ার্ড দিন");

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])/;
        if (!passwordRegex.test(password)) return setError("পাসওয়ার্ডে আপার, লোয়ার, সংখ্যা ও বিশেষ চিহ্ন থাকতে হবে");

        if (!role) return setError("দয়া করে আপনার রোল (রোগী বা ডাক্তার) নির্বাচন করুন");`;

const newValidation = `    // Handle registration
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
            const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
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
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])/;
            if (!passwordRegex.test(password)) {
                setPasswordError("পাসওয়ার্ডে আপার, লোয়ার, সংখ্যা ও বিশেষ চিহ্ন থাকতে হবে");
                hasError = true;
            }
        }

        if (!role) {
            setRoleError("দয়া করে আপনার রোল (রোগী বা ডাক্তার) নির্বাচন করুন");
            hasError = true;
        }

        if (hasError) return;`;

if (content.includes(oldValidation)) {
    content = content.replace(oldValidation, newValidation);
    fs.writeFileSync('src/pages/signup/Register.jsx', content, 'utf8');
    console.log('✓ Updated validation logic in Register.jsx');
} else {
    console.log('✗ Could not find the old validation pattern');
}
