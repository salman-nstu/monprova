import { useState } from "react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useQuestion from "../../hooks/useQuestion";
import usePatient from "../../hooks/usePatient";
import useDoctor from "../../hooks/useDoctor";

// 🔥 Avatar Component
const Avatar = ({ name = "", image, size = 40 }) => {
  const firstLetter = name?.split(" ")[0]?.charAt(0).toUpperCase() || "?";

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover"
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400
                 flex items-center justify-center text-white font-bold text-lg"
    >
      {firstLetter}
    </div>
  );
};

const AdminHelp = () => {
  const axiosPublic = useAxiosPublic();
  const [questions, refetchQuestions] = useQuestion();
  const [patients] = usePatient();
  const [doctors] = useDoctor();

  const [filterStatus, setFilterStatus] = useState("pending"); // pending, approved, declined
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // 🔥 Filter questions by status
  const filteredQuestions = questions
    .filter(q => q.status === filterStatus)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // ✅ Approve selected questions
  const handleApprove = async () => {
    if (selectedQuestions.length === 0) return;
    await Promise.all(
      selectedQuestions.map(qId =>
        axiosPublic.patch(`/api/question/${qId}`, { status: "approved" })
      )
    );
    setSelectedQuestions([]);
    setSelectAll(false);
    refetchQuestions();
  };

  // ❌ Decline selected questions
  const handleDecline = async () => {
    if (selectedQuestions.length === 0) return;
    await Promise.all(
      selectedQuestions.map(qId =>
        axiosPublic.patch(`/api/question/${qId}`, { status: "declined" })
      )
    );
    setSelectedQuestions([]);
    setSelectAll(false);
    refetchQuestions();
  };

  // Toggle selection of a question
  const toggleSelect = (questionId) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedQuestions([]);
      setSelectAll(false);
    } else {
      const allIds = filteredQuestions.map(q => q._id);
      setSelectedQuestions(allIds);
      setSelectAll(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#E6F0FF] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          সহায়তা কেন্দ্র ম্যানেজমেন্ট
        </h1>

        {/* Filter Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Filter Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                স্ট্যাটাস ফিল্টার
              </label>
              <div className="flex gap-4 flex-wrap">
                <button
                  className={`px-6 py-2 rounded-md font-medium transition ${
                    filterStatus === "pending"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  onClick={() => setFilterStatus("pending")}
                >
                  অপেক্ষমান
                </button>
                <button
                  className={`px-6 py-2 rounded-md font-medium transition ${
                    filterStatus === "approved"
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  onClick={() => setFilterStatus("approved")}
                >
                  অনুমোদিত
                </button>
                <button
                  className={`px-6 py-2 rounded-md font-medium transition ${
                    filterStatus === "declined"
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  onClick={() => setFilterStatus("declined")}
                >
                  প্রত্যাখ্যাত
                </button>
              </div>
            </div>

            {/* Select All & Bulk Actions */}
            {filterStatus === "pending" && filteredQuestions.length > 0 && (
              <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-gray-200">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-700">সব নির্বাচন করুন</span>
                </label>

                {selectedQuestions.length > 0 && (
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={handleApprove}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition"
                    >
                      নির্বাচিত অনুমোদন করুন ({selectedQuestions.length})
                    </button>
                    <button
                      onClick={handleDecline}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
                    >
                      নির্বাচিত প্রত্যাখ্যান করুন ({selectedQuestions.length})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">অপেক্ষমান প্রশ্ন</p>
              <p className="text-2xl font-bold text-blue-600">
                {questions.filter(q => q.status === "pending").length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">অনুমোদিত প্রশ্ন</p>
              <p className="text-2xl font-bold text-green-600">
                {questions.filter(q => q.status === "approved").length}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">প্রত্যাখ্যাত প্রশ্ন</p>
              <p className="text-2xl font-bold text-red-600">
                {questions.filter(q => q.status === "declined").length}
              </p>
            </div>
          </div>
        </div>

        {/* Questions List */}
        {filteredQuestions.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <p className="text-gray-500 text-lg">
              কোন {filterStatus === "pending" ? "অপেক্ষমান" : filterStatus === "approved" ? "অনুমোদিত" : "প্রত্যাখ্যাত"} প্রশ্ন নেই।
            </p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredQuestions.map((q) => {
                const patient = patients.find(p => p._id === q.patientID);
                const isSelected = selectedQuestions.includes(q._id);

                return (
                  <div
                    key={q._id}
                    className={`p-6 hover:bg-gray-50 transition ${
                      isSelected ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex gap-4 items-start">
                      {/* Checkbox for pending questions */}
                      {filterStatus === "pending" && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(q._id)}
                          className="mt-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      )}

                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <Avatar name={patient?.name} image={patient?.image} size={40} />
                      </div>

                      {/* Question Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-gray-900">
                            {patient?.name || "Unknown Patient"}
                          </p>
                          {filterStatus !== "pending" && (
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                filterStatus === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {filterStatus === "approved" ? "অনুমোদিত" : "প্রত্যাখ্যাত"}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-700 mb-2 break-words">{q.question}</p>

                        <p className="text-xs text-gray-500">
                          {new Date(q.createdAt).toLocaleDateString('bn-BD', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-4 text-center text-gray-600">
          দেখানো হচ্ছে {filteredQuestions.length} টি প্রশ্ন (মোট {questions.length} টি)
        </div>
      </div>
    </div>
  );
};

export default AdminHelp;
