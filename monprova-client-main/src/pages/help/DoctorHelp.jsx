import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useDoctor from "../../hooks/useDoctor";
import usePatient from "../../hooks/usePatient";
import useQuestion from "../../hooks/useQuestion";
import useReply from "../../hooks/useReply";

const DoctorHelp = () => {
  const { user } = useAuth();
  const axiosPublic = useAxiosPublic();

  const [questions] = useQuestion();
  const [doctors] = useDoctor();
  const [patients] = usePatient();
  const [replies, refetchReplies] = useReply();

  const [showHelp, setShowHelp] = useState(true);
  const [expandedReplies, setExpandedReplies] = useState({});

  // current logged doctor
  const doctor = doctors?.find(d => d.email === user?.email);
  const doctorID = doctor?._id;
  const doctorName = doctor?.name;

  // submit reply
  const handleReplySubmit = async (e, questionId) => {
    e.preventDefault();

    if (doctor?.verificationStatus !== "verified") return;

    const replyText = e.target.reply.value;

    const replyData = {
      reply: replyText,
      doctorID,
      doctorName,
      createdAt: new Date(),
    };

    await axiosPublic.post(
      `/api/question/reply/${questionId}`,
      replyData
    );

    e.target.reset();
    refetchReplies();
  };

  // approved questions (latest first)
  const approvedQuestions = questions
    ?.filter(q => q.status === "approved")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="max-w-4xl mx-auto min-h-screen p-4">
      {/* Header */}
      <div className="mb-4 rounded-xl p-4 text-center text-white
        bg-gradient-to-r from-blue-600 to-teal-500 shadow">
        <h1 className="text-2xl font-semibold">
          রোগীদের প্রশ্ন ও ডাক্তারের উত্তর
        </h1>
      </div>

      {/* Toggle */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className={`px-6 py-2 rounded-full text-white font-medium
          ${showHelp ? "bg-red-500" : "bg-green-600"}`}
        >
          {showHelp ? "বন্ধ করুন" : "দেখুন"}
        </button>
      </div>

      {showHelp && (
        <div className="space-y-6">
          {approvedQuestions?.length === 0 && (
            <p className="text-center text-gray-500 mt-10">
              এখনো কোনো অনুমোদিত প্রশ্ন নেই।
            </p>
          )}

          {approvedQuestions?.map(q => {
            const patient = patients?.find(
              p => p._id === q.patientID
            );

            const questionReplies = replies
              ?.filter(r => r.questionId === q._id)
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            const visibleReplies = expandedReplies[q._id]
              ? questionReplies
              : questionReplies.slice(0, 2);

            return (
              <div key={q._id} className="bg-white border rounded-xl p-5">
                {/* Question */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden
                    bg-gray-400 flex items-center justify-center
                    text-white font-semibold shrink-0">
                    {patient?.image ? (
                      <img
                        src={patient.image}
                        alt={patient.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="uppercase">
                        {patient?.name?.charAt(0)}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">
                      {patient?.name || "Unknown Patient"}
                    </p>
                    <p className="text-gray-800">{q.question}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(q.createdAt).toLocaleString("en-GB")}
                    </p>
                  </div>
                </div>

                {/* Replies */}
                <div className="mt-4 ml-12 space-y-3">
                  {visibleReplies.map((r, i) => {
                    const replyDoctor = doctors?.find(
                      d => d._id === r.doctorID
                    );

                    return (
                      <div key={i} className="flex gap-3 items-start">
                        {/* ✅ FIXED DOCTOR AVATAR */}
                        <Link
                          to={`/doctorDetails//${replyDoctor?._id}`}
                          className="w-10 h-10 rounded-full overflow-hidden
                          bg-gray-400 flex items-center justify-center
                          text-white font-semibold shrink-0
                          hover:ring-2 hover:ring-blue-500 transition"
                        >
                          {replyDoctor?.image ? (
                            <img
                              src={replyDoctor.image}
                              alt={replyDoctor?.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="uppercase">
                              {replyDoctor?.name?.charAt(0)}
                            </span>
                          )}
                        </Link>

                        <div className="bg-gray-100 rounded-2xl px-4 py-2 max-w-[85%]">
                          <p className="text-sm font-semibold text-blue-700">
                            {r.doctorName}
                          </p>
                          <p className="text-sm text-gray-800">
                            {r.reply}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(r.createdAt).toLocaleString("en-GB")}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Show More / Less */}
                  {questionReplies.length > 2 && (
                    <button
                      onClick={() =>
                        setExpandedReplies(prev => ({
                          ...prev,
                          [q._id]: !prev[q._id],
                        }))
                      }
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {expandedReplies[q._id]
                        ? "Show less replies"
                        : `Show more replies (${questionReplies.length - 2})`}
                    </button>
                  )}

                  {questionReplies.length === 0 && (
                    <p className="text-sm text-gray-400 italic">
                      এখনো কোনো ডাক্তারের উত্তর নেই।
                    </p>
                  )}
                </div>

                {/* Reply Input */}
                {doctor ? (
                  doctor.verificationStatus === "verified" ? (
                    <form
                      onSubmit={(e) =>
                        handleReplySubmit(e, q._id)
                      }
                      className="flex gap-2 mt-4 ml-12"
                    >
                      <input
                        name="reply"
                        required
                        placeholder="উত্তর লিখুন..."
                        className="flex-1 px-4 py-2 rounded-full border
                        focus:outline-none focus:ring-2
                        focus:ring-blue-500"
                      />
                      <button
                        className="px-5 py-2 rounded-full bg-blue-600
                        text-white hover:bg-blue-700"
                      >
                        উত্তর দিন
                      </button>
                    </form>
                  ) : (
                    <p className="mt-4 ml-12 text-sm text-red-500 italic">
                      ⚠️ উত্তর দিতে হলে আপনার ডাক্তারের অ্যাকাউন্ট
                      ভেরিফাইড হতে হবে।
                    </p>
                  )
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorHelp;
