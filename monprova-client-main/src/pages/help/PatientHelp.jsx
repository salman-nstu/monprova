import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useDoctor from "../../hooks/useDoctor";
import usePatient from "../../hooks/usePatient";
import useQuestion from "../../hooks/useQuestion";
import useReply from "../../hooks/useReply";

// 🔥 Avatar component
const Avatar = ({ name = "", image, size = 40 }) => {
  const firstLetter = name?.charAt(0)?.toUpperCase() || "?";

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

const PatientHelp = () => {
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();

  const [patients] = usePatient();
  const [doctors] = useDoctor();
  const [questions, refetch] = useQuestion();
  const [replies] = useReply();

  const patient = patients?.find(p => p.email === user?.email);
  const patientID = patient?._id;

  // Patient-এর প্রশ্ন (latest first)
  const patientQuestions = questions
    ?.filter(q => q.patientID === patientID)
    ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || [];

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();

    if (!patientID) return;

    const subject = e.target.subject.value;
    const question = e.target.question.value;

    const questionData = {
      subject,
      question,
      patientID,
      status: "pending",
      patientName: patient?.name,
      patientImage: patient?.image || null,
      createdAt: new Date(),
    };

    try {
      await axiosPublic.post("/api/question", questionData);
      refetch();
      e.target.reset();
    } catch (error) {
      console.error("Question submit failed", error);
    }
  };

  const replyColors = [
    "bg-pink-50",
    "bg-purple-50",
    "bg-blue-50",
    "bg-green-50",
    "bg-yellow-50",
  ];

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col">
      {/* Header + Form */}
      <div className="sticky top-0 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 z-10 shadow p-4 rounded-b-2xl">
        <h1 className="text-2xl font-bold text-center mb-3 text-indigo-800">
          ডাক্তারদের কাছে প্রশ্ন করুন
        </h1>

        <form onSubmit={handleQuestionSubmit} className="space-y-3">
          <input
            type="text"
            name="subject"
            required
            placeholder="আপনার প্রশ্নের বিষয় লিখুন..."
            className="border p-3 w-full rounded-xl bg-purple-50"
          />

          <textarea
            name="question"
            required
            rows={3}
            placeholder="আপনার বিস্তারিত প্রশ্ন লিখুন..."
            className="border p-3 w-full rounded-xl bg-indigo-50"
          />

          <div className="flex justify-center">
            <button
              type="submit"
              className="px-10 py-2 rounded-full text-white font-semibold
              bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            >
              প্রশ্ন পাঠান
            </button>
          </div>
        </form>
      </div>

      {/* Questions */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-indigo-50 mt-4">
        {patientQuestions.map((q) => {
          const questionReplies = replies
            ?.filter(r => r.questionId === q._id)
            ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || [];

          return (
            <div key={q._id} className="bg-white shadow-md rounded-2xl p-4">
              {/* Question */}
              <div className="flex gap-3">
                <Avatar name={patient?.name} image={patient?.image} />

                <div className="flex-1">
                  <p className="font-semibold text-indigo-700">
                    {patient?.name}
                  </p>

                  {q.subject && (
                    <p className="text-sm text-gray-600">
                      বিষয়: {q.subject}
                    </p>
                  )}

                  <p className="mt-1">{q.question}</p>

                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(q.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Replies */}
              <div className="ml-12 mt-4 space-y-3">
                {questionReplies.length ? (
                  questionReplies.map((r, i) => {
                    const doctor = doctors?.find(d => d._id === r.doctorID);
                    const bg = replyColors[i % replyColors.length];

                    return (
                      <div key={r._id || i} className="flex gap-3">
                        <Link to={`/doctorDetails/${doctor._id}`}>
                          <Avatar
                            name={r.doctorName}
                            image={doctor?.image}
                            size={36}
                          />

                        </Link>
                        <div className={`${bg} p-3 rounded-xl flex-1`}>
                          <p className="text-sm font-semibold text-blue-600">
                            👨‍⚕️ {r.doctorName}
                          </p>

                          <p className="mt-1">{r.reply}</p>

                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(r.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    এখনো কোনো উত্তর পাওয়া যায়নি।
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {patientQuestions.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            এখনো কোনো প্রশ্ন করা হয়নি।
          </p>
        )}
      </div>
    </div>
  );
};

export default PatientHelp;
