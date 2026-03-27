import React, { useState } from 'react';
import PageCover from '../shared/PageCover';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import Swal from "sweetalert2";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    status: 'pending',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const axiosPublic = useAxiosPublic();

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset messages
    setError('');
    setSuccess(false);

    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      Swal.fire({
        icon: "warning",
        title: "সকল ফিল্ড পূরণ করুন",
        text: "অনুগ্রহ করে সমস্ত ফিল্ড পূরণ করুন।",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axiosPublic.post("/api/complaints", formData);

   
        Swal.fire({
          icon: "success",
          title: "ফর্ম জমা হয়েছে",
          text: "আপনার অভিযোগ সফলভাবে জমা হয়েছে।",
          timer: 3000,
          showConfirmButton: false,
        });

        // Reset form
        setFormData({ name: '', email: '', phone: '', message: '' });
        setSuccess(true);
      
    } catch (err) {
      console.error("Error submitting complaint:", err);
      const errorMessage = err.response?.data?.message || err.message || "অনুগ্রহ করে আবার চেষ্টা করুন।";
      setError(errorMessage);

      Swal.fire({
        icon: "error",
        title: "ফর্ম জমা দিতে ব্যর্থ",
        text: errorMessage,
        timer: 3000,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageCover 
        coverTitle="আমাদের সাথে যোগাযোগ করুন" 
        coverSubtitle="আপনার যেকোনো প্রশ্ন বা পরামর্শের জন্য আমাদের সাথে যোগাযোগ করুন" 
        coverImg="https://i.ibb.co/CsbSwPgp/thought-catalog-505eect-W54k-unsplash.jpg" 
      />
      
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Contact Information */}
          <div className="flex flex-col gap-8">
            <h2 className="text-3xl font-bold text-primary-color mb-6">যোগাযোগের তথ্য</h2>
            
            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="text-2xl text-secondary-color">
                <i className="fas fa-phone"></i>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">ফোন নম্বর</h3>
                <p className="text-gray-600 text-lg">+880 1234-567890</p>
                <p className="text-gray-600 text-lg">+880 9876-543210</p>
                <p className="text-sm text-gray-500 mt-2">সোমবার - শুক্রবার, সকাল ৯:০০ - রাত ৬:০০</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="text-2xl text-secondary-color">
                <i className="fas fa-envelope"></i>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">ইমেইল</h3>
                <p className="text-gray-600 text-lg break-all">
                  <a href="mailto:support@monprova.com" className="hover:text-primary-color underline">
                    support@monprova.com
                  </a>
                </p>
                <p className="text-gray-600 text-lg break-all">
                  <a href="mailto:info@monprova.com" className="hover:text-primary-color underline">
                    info@monprova.com
                  </a>
                </p>
                <p className="text-sm text-gray-500 mt-2">আমরা ২৪ ঘন্টার মধ্যে সাড়া দিব</p>
              </div>
            </div>
          </div>

          {/* Message Box */}
          <div className="bg-gray-50 p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-primary-color mb-6">আমাদের বার্তা পাঠান</h3>
            
            {success && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                আপনার বার্তা সফলভাবে জমা দেওয়া হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* Form using onSubmit */}
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <input 
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="আপনার নাম" 
                className="border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-primary-color"
              />
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="আপনার ইমেইল" 
                className="border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-primary-color"
              />
              <input 
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="আপনার ফোন নম্বর" 
                className="border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-primary-color"
              />
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="আপনার বার্তা লিখুন" 
                rows="5" 
                className="border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-primary-color"
              ></textarea>

              <button 
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white py-3 px-6 rounded font-semibold hover:bg-opacity-90 transition disabled:bg-gray-400"
              >
                {loading ? 'জমা দিচ্ছে...' : 'পাঠান'}
              </button>
            </form>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-16 bg-blue-50 border-l-4 border-primary-color p-8 rounded max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold text-primary-color mb-4">প্রয়োজনে আমাদের সাথে যোগাযোগ করুন</h3>
          <p className="text-gray-700 leading-relaxed">
            আমরা আপনার মানসিক স্বাস্থ্য সম্পর্কিত যেকোনো প্রশ্ন, পরামর্শ বা অভিযোগ শুনতে সবসময় প্রস্তুত। আপনার সুবিধামত সময়ে আমাদের সাথে যোগাযোগ করুন। আমাদের পেশাদার টিম আপনাকে সর্বোত্তম সেবা প্রদান করতে প্রতিশ্রুতিবদ্ধ।
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
