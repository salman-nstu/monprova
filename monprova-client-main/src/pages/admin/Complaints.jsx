import React, { useState } from 'react';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useComplaint from '../../hooks/useComplaint';
import useAxiosPublic from '../../hooks/useAxiosPublic';

const Complaints = () => {
  const axiosSecure = useAxiosSecure();
  const axiosPublic = useAxiosPublic();

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // ✅ Save-then-update status
  const [editStatus, setEditStatus] = useState('pending');

  const [complaints, refetch] = useComplaint();

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await axiosPublic.patch(`/api/complaints/${complaintId}`, { status: newStatus });
    
      setSelectedComplaint(null);
      setEditStatus(newStatus);
      refetch()
    } catch (error) {
      console.error('Error updating complaint status:', error);
    }
  };

  const filteredComplaints =
    filterStatus === 'all'
      ? complaints
      : complaints.filter((complaint) => complaint.status === filterStatus);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-primary-color">অভিযোগ ব্যবস্থাপনা</h2>

      {/* Filter */}
      <div className="mb-6 flex gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded focus:outline-none focus:border-primary-color"
        >
          <option value="all">সব অভিযোগ</option>
          <option value="pending">অপেক্ষমাণ</option>
          <option value="resolved">সমাধান হয়েছে</option>
          <option value="in-progress">প্রক্রিয়াধীন</option>
        </select>
      </div>

      {/* Complaints Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-primary-color text-white">
              <th className="border px-4 py-2 text-left">নাম</th>
              <th className="border px-4 py-2 text-left">ইমেইল</th>
              <th className="border px-4 py-2 text-left">ফোন</th>
              <th className="border px-4 py-2 text-left">অভিযোগ</th>
              <th className="border px-4 py-2 text-left">স্ট্যাটাস</th>
              <th className="border px-4 py-2 text-left">তারিখ</th>
              <th className="border px-4 py-2 text-center">অ্যাকশন</th>
            </tr>
          </thead>

          <tbody>
            {filteredComplaints?.length > 0 ? (
              filteredComplaints.map((complaint) => (
                <tr key={complaint._id} className="hover:bg-gray-50">
                  <td className="border px-4 py-3">{complaint.name}</td>
                  <td className="border px-4 py-3 text-sm">{complaint.email}</td>
                  <td className="border px-4 py-3">{complaint.phone}</td>

                  <td className="border px-4 py-3 max-w-xs truncate">{complaint.message}</td>

                  <td className="border px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded text-white text-sm] ${
                        complaint.status === 'pending'
                          ? 'bg-yellow-500'
                          : complaint.status === 'in-progress'
                          ? 'bg-blue-500'
                          : 'bg-green-500'
                      }`}
                    >
                      {complaint.status === 'pending'
                        ? 'অপেক্ষমাণ'
                        : complaint.status === 'in-progress'
                        ? 'প্রক্রিয়াধীন'
                        : 'সমাধানহয়েছে'}
                    </span>
                  </td>

                  <td className="border px-4 py-3 text-sm">
                    {new Date(complaint.createdAt).toLocaleDateString('bn-BD')}
                  </td>

                  <td className="border px-4 py-3 text-center">
                    <button
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setEditStatus(complaint.status); // ✅ set current status for editing
                      }}
                      className="bg-primary-color text-white px-3 py-1 rounded hover:bg-opacity-90 transition text-sm"
                    >
                      দেখুন
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="border px-4 py-3 text-center text-gray-500">
                  কোনো অভিযোগ পাওয়া যায়নি
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4 text-primary-color">অভিযোগ বিস্তারিত</h3>

            <div className="space-y-4">
              <div>
                <label className="font-semibold text-gray-700">নাম:</label>
                <p className="text-gray-600">{selectedComplaint.name}</p>
              </div>

              <div>
                <label className="font-semibold text-gray-700">ইমেইল:</label>
                <p className="text-gray-600">{selectedComplaint.email}</p>
              </div>

              <div>
                <label className="font-semibold text-gray-700">ফোন:</label>
                <p className="text-gray-600">{selectedComplaint.phone}</p>
              </div>

              <div>
                <label className="font-semibold text-gray-700">অভিযোগ:</label>
                <p className="text-gray-600 bg-gray-50 p-3 rounded">
                  {selectedComplaint.message}
                </p>
              </div>

              <div>
                <label className="font-semibold text-gray-700">স্ট্যাটাস পরিবর্তন করুন:</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)} // ✅ only changes local state
                  className="w-full px-3 py-2 border rounded mt-2 focus:outline-none focus:border-primary-color"
                >
                  <option value="pending">অপেক্ষমাণ</option>
                  <option value="in-progress">প্রক্রিয়াধীন</option>
                  <option value="resolved">সমাধান হয়েছে</option>
                </select>
              </div>
            </div>

            {/* ✅ Save Button */}
            <button
              onClick={() => handleStatusChange(selectedComplaint._id, editStatus)}
              className="w-full mt-6 bg-primary-color text-white py-2 px-4 rounded hover:bg-opacity-90 transition"
            >
              সেভ করুন
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedComplaint(null);
                setEditStatus('pending');
              }}
              className="w-full mt-3 bg-secondary-color text-white py-2 px-4 rounded hover:bg-opacity-90 transition"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;
