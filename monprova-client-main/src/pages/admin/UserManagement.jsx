import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { FaEye, FaTrash, FaSearch, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";

const UserManagement = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [profileFilter, setProfileFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [searchQuery, roleFilter, users, sortBy, sortOrder, profileFilter]);

  const fetchAllData = async () => {
    try {
      // Fetch users and doctors
      const [usersRes, doctorsRes] = await Promise.all([
        axiosSecure.get("/api/users"),
        axiosSecure.get("/api/doctors")
      ]);
      
      setUsers(usersRes.data);
      setDoctors(doctorsRes.data);
      
      // Count patients with completed profiles (have updatedAt field)
      const completedProfiles = usersRes.data.filter(u => 
        u.role === "patient" && u.updatedAt != null
      ).length;
      setPatients({ length: completedProfiles });
      
      setFilteredUsers(usersRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        icon: "error",
        title: "ত্রুটি!",
        text: "ডেটা লোড করতে সমস্যা হয়েছে",
        confirmButtonColor: "#d33"
      });
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = users;

    // Filter to show only patient users (exclude doctors and admins based on role field)
    filtered = filtered.filter(user => {
      // Only include users with role "patient"
      return user.role === "patient";
    });

    // Filter by search query (name or email)
    if (searchQuery.trim()) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by profile completion status
    if (profileFilter !== "all") {
      if (profileFilter === "completed") {
        filtered = filtered.filter(user => user.updatedAt != null);
      } else if (profileFilter === "incomplete") {
        filtered = filtered.filter(user => user.updatedAt == null);
      }
    }

    // Sort users
    filtered.sort((a, b) => {
      let compareValue = 0;

      switch(sortBy) {
        case "name":
          compareValue = (a.name || "").localeCompare(b.name || "");
          break;
        case "email":
          compareValue = (a.email || "").localeCompare(b.email || "");
          break;
        case "createdAt":
          compareValue = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          break;
        case "updatedAt":
          compareValue = new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0);
          break;
        default:
          compareValue = 0;
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    setFilteredUsers(filtered);
  };

  // Check if user has completed patient profile (has updatedAt field)
  const hasPatientProfile = (user) => {
    return user.updatedAt != null;
  };

  // Get user type based on patient profile completion
  const getUserType = (user) => {
    if (hasPatientProfile(user)) {
      return "patient";
    }
    return "user";
  };

  const getUserTypeBangla = (user) => {
    if (hasPatientProfile(user)) {
      return "রোগী";
    }
    return "সাধারণ ব্যবহারকারী";
  };

  const handleDelete = async (userId, userName) => {
    const result = await Swal.fire({
      title: "নিশ্চিত করুন",
      text: `আপনি কি "${userName}" কে মুছে ফেলতে চান?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "হ্যাঁ, মুছে ফেলুন!",
      cancelButtonText: "বাতিল"
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosSecure.delete(`/api/users/${userId}`);
        if (response.data.deletedCount > 0) {
          Swal.fire({
            icon: "success",
            title: "সফল!",
            text: "ব্যবহারকারী সফলভাবে মুছে ফেলা হয়েছে",
            confirmButtonColor: "#10b981"
          });
          fetchAllData(); // Refresh the list
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire({
          icon: "error",
          title: "ত্রুটি!",
          text: error.response?.data?.message || "ব্যবহারকারী মুছতে সমস্যা হয়েছে",
          confirmButtonColor: "#d33"
        });
      }
    }
  };

  const handleViewDetails = (userId) => {
    navigate(`/dashboardAdmin/users/${userId}`);
  };

  const getRoleBadgeColor = (userType) => {
    switch (userType) {
      case "patient":
        return "bg-green-100 text-green-800";
      case "user":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
          ব্যবহারকারী ম্যানেজমেন্ট
        </h1>

        {/* Search Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters and Sort */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Profile Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  প্রোফাইল স্ট্যাটাস
                </label>
                <select
                  value={profileFilter}
                  onChange={(e) => setProfileFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">সব</option>
                  <option value="completed">সম্পূর্ণ প্রোফাইল</option>
                  <option value="incomplete">অসম্পূর্ণ প্রোফাইল</option>
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
                  <option value="name">নাম অনুসারে</option>
                  <option value="email">ইমেইল অনুসারে</option>
                  <option value="createdAt">নিবন্ধনের তারিখ অনুসারে</option>
                  <option value="updatedAt">আপডেট তারিখ অনুসারে</option>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">মোট রোগী ব্যবহারকারী</p>
              <p className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === "patient").length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">সম্পূর্ণ প্রোফাইল (রোগী)</p>
              <p className="text-2xl font-bold text-green-600">{patients.length}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">দেখানো হচ্ছে</p>
              <p className="text-2xl font-bold text-yellow-600">
                {filteredUsers.length}
              </p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    নাম
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ইমেইল
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    প্রোফাইল স্ট্যাটাস
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    কার্যক্রম
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      কোনো ব্যবহারকারী পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                            getUserType(user)
                          )}`}
                        >
                          {getUserTypeBangla(user)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(user._id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition"
                            title="বিস্তারিত দেখুন"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleDelete(user._id, user.name || user.email)}
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
          দেখানো হচ্ছে {filteredUsers.length} জন রোগী ব্যবহারকারী (মোট {users.filter(u => u.role === "patient").length} জন)
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
