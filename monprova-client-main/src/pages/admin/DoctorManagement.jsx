import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { FaEye, FaTrash, FaSearch, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";

const DoctorManagement = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [verificationFilter, setVerificationFilter] = useState("all");

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterAndSortDoctors();
  }, [searchQuery, doctors, sortBy, sortOrder, verificationFilter]);

  const fetchDoctors = async () => {
    try {
      const response = await axiosSecure.get("/api/doctors");
      setDoctors(response.data);
      setFilteredDoctors(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      Swal.fire({
        icon: "error",
        title: "ত্রুটি!",
        text: "ডাক্তারদের তথ্য লোড করতে সমস্যা হয়েছে",
        confirmButtonColor: "#d33"
      });
      setLoading(false);
    }
  };

  const filterAndSortDoctors = () => {
    let filtered = doctors;

    // Filter by search query (name or email)
    if (searchQuery.trim()) {
      filtered = filtered.filter(doctor => 
        doctor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.expertise?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by verification status
    if (verificationFilter !== "all") {
      filtered = filtered.filter(doctor => 
        doctor.verificationStatus === verificationFilter
      );
    }

    // Sort doctors
    filtered = [...filtered].sort((a, b) => {
      let compareValue = 0;
      
      switch(sortBy) {
        case "name":
          compareValue = (a.name || "").localeCompare(b.name || "");
          break;
        case "email":
          compareValue = (a.email || "").localeCompare(b.email || "");
          break;
        case "fee":
          compareValue = (a.consultationFee || 0) - (b.consultationFee || 0);
          break;
        case "experience":
          compareValue = (a.yearsOfExperience || 0) - (b.yearsOfExperience || 0);
          break;
        case "createdAt":
          compareValue = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          break;
        default:
          compareValue = 0;
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    setFilteredDoctors(filtered);
  };

  const handleDelete = async (doctorId, doctorName) => {
    const result = await Swal.fire({
      title: "নিশ্চিত করুন",
      text: `আপনি কি "${doctorName}" কে মুছে ফেলতে চান?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "হ্যাঁ, মুছে ফেলুন!",
      cancelButtonText: "বাতিল"
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosSecure.delete(`/api/doctors/${doctorId}`);
        if (response.data.deletedCount > 0) {
          Swal.fire({
            icon: "success",
            title: "সফল!",
            text: "ডাক্তার সফলভাবে মুছে ফেলা হয়েছে",
            confirmButtonColor: "#10b981"
          });
          fetchDoctors(); // Refresh the list
        }
      } catch (error) {
        console.error("Error deleting doctor:", error);
        Swal.fire({
          icon: "error",
          title: "ত্রুটি!",
          text: error.response?.data?.message || "ডাক্তার মুছতে সমস্যা হয়েছে",
          confirmButtonColor: "#d33"
        });
      }
    }
  };

  const handleViewDetails = (doctorId) => {
    navigate(`/dashboardAdmin/doctors/${doctorId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">লোড হচ্ছে...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E6F0FF] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          ডাক্তার ম্যানেজমেন্ট
        </h1>

        {/* Search Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="নাম, ইমেইল বা বিশেষত্ব দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters and Sort */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Verification Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ভেরিফিকেশন স্ট্যাটাস
                </label>
                <select
                  value={verificationFilter}
                  onChange={(e) => setVerificationFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">সব</option>
                  <option value="verified">ভেরিফাইড</option>
                  <option value="pending">অপেক্ষমাণ</option>
                  <option value="rejected">প্রত্যাখ্যাত</option>
                  <option value="not-verified">ভেরিফাইড নয়</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  সাজান
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">নাম</option>
                  <option value="email">ইমেইল</option>
                  <option value="fee">পরামর্শ ফি</option>
                  <option value="experience">অভিজ্ঞতা</option>
                  <option value="createdAt">নিবন্ধনের তারিখ</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ক্রম
                </label>
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2"
                >
                  {sortOrder === "asc" ? (
                    <>
                      <FaSortAmountUp /> ঊর্ধ্বক্রম
                    </>
                  ) : (
                    <>
                      <FaSortAmountDown /> নিম্নক্রম
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">মোট ডাক্তার</p>
              <p className="text-2xl font-bold text-green-600">{doctors.length}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">দেখানো হচ্ছে</p>
              <p className="text-2xl font-bold text-blue-600">
                {filteredDoctors.length}
              </p>
            </div>
          </div>
        </div>

        {/* Doctors Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    নাম
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ইমেইল
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    বিশেষত্ব
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ফি
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    কার্যক্রম
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      কোনো ডাক্তার পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <tr key={doctor._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900 break-words max-w-[200px]">
                          {doctor.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-500 break-words max-w-[200px]">{doctor.email}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-500 break-words max-w-[150px]">
                          {doctor.expertise || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          ৳ {doctor.consultationFee || 0}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(doctor._id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition"
                            title="বিস্তারিত দেখুন"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleDelete(doctor._id, doctor.name || doctor.email)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md transition"
                            title="মুছে ফেলুন"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-center text-gray-600">
          দেখানো হচ্ছে {filteredDoctors.length} জন ডাক্তার (মোট {doctors.length} জন)
        </div>
      </div>
    </div>
  );
};

export default DoctorManagement;
