import React, { useEffect, useState, useCallback } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useDoctor from "../../hooks/useDoctor";
import useAuth from "../../hooks/useAuth";

const Income = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const [doctors] = useDoctor();
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [netIncome, setNetIncome] = useState(0);
  const [payouts, setPayouts] = useState([]);
  const [totalReceived, setTotalReceived] = useState(0);
  const [pending, setPending] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDoctorData = useCallback(async (doctorId, doctorFee) => {
    try {
      console.log("=== INCOME PAGE DEBUG START ===");
      console.log("Fetching data for doctorId:", doctorId);
      console.log("Doctor consultation fee:", doctorFee);
      
      // Fetch ALL appointments first
      const appointmentsResponse = await axiosSecure.get('/api/appointments');
      const allAppointments = appointmentsResponse.data;
      console.log("Total appointments fetched:", allAppointments.length);
      
      // Filter by doctorID
      const doctorAppointments = allAppointments.filter(app => app.doctorID === doctorId);
      console.log(`Appointments for doctor ${doctorId}:`, doctorAppointments.length);
      console.log("Sample appointment:", doctorAppointments[0]);
      
      // Filter by paymentStatus = 'paid' (all booked appointments)
      const paidAppointments = doctorAppointments.filter(app => 
        app.paymentStatus === 'paid'
      );
      console.log("Paid appointments for this doctor:", paidAppointments.length);
      console.log("Paid appointments data:", paidAppointments);
      console.log("Fees from paid appointments:", paidAppointments.map(app => ({ 
        id: app._id, 
        fee: app.fee, 
        consultationFee: app.consultationFee,
        feeType: typeof app.fee,
        patientName: app.patientName,
        state: app.state
      })));

      setAppointments(paidAppointments);

      // Calculate total income using actual fee from each appointment
      const total = paidAppointments.reduce((sum, app) => {
        // Use fee from appointment, fallback to doctor's consultation fee
        const appointmentFee = Number(app.fee) || Number(app.consultationFee) || Number(doctorFee) || 0;
        console.log(`Processing appointment ${app._id}: fee=${app.fee}, consultationFee=${app.consultationFee}, doctorFee=${doctorFee}, using=${appointmentFee}`);
        return sum + appointmentFee;
      }, 0);
      const net = total * 0.8; // 80% to doctor

      console.log("TOTAL INCOME:", total);
      console.log("NET INCOME (80%):", net);
      
      setTotalIncome(total);
      setNetIncome(net);

      // Fetch payouts for this doctor
      const payoutsResponse = await axiosSecure.get(`/api/payouts?doctorId=${doctorId}`);
      const doctorPayouts = payoutsResponse.data;
      console.log("Payouts fetched:", doctorPayouts);
      
      const received = doctorPayouts.reduce(
        (sum, p) => sum + (Number(p.amount) || 0),
        0
      );
      console.log("Total received:", received);
      
      setTotalReceived(received);
      setPayouts(doctorPayouts);
      setPending(net - received);
      console.log("=== INCOME PAGE DEBUG END ===");
      setIsLoading(false);

    } catch (error) {
      console.error("Error fetching doctor data:", error);
      console.error("Error details:", error.response?.data);
      setIsLoading(false);
    }
  }, [axiosSecure]);

  useEffect(() => {
    // Find doctor profile using logged-in user's email
    if (user?.email && doctors.length > 0) {
      const doctorProfile = doctors.find(d => d.email === user.email);
      console.log("Found doctor profile:", doctorProfile);
      setDoctor(doctorProfile);
      
      if (doctorProfile?._id && doctorProfile?.consultationFee) {
        fetchDoctorData(doctorProfile._id, doctorProfile.consultationFee);
      } else {
        console.log("Missing doctorId or consultationFee", doctorProfile);
        setIsLoading(false);
      }
    }
  }, [user, doctors, fetchDoctorData]);

  return (
    <div className="bg-[#EFF7FE] p-4 min-h-screen">
      <div className="min-h-[850px] bg-white rounded-md p-8 shadow-sm border border-gray-200">
        <h2 className="text-xl text-gray-800 p-4 mb-8 font-bold text-center rounded-md bg-[#EFF7FE] border">
          আয় সংক্রান্ত তথ্য
        </h2>

        <p className="text-center text-red-500 my-4">
          প্রতি অ্যাপয়েন্টমেন্টে মনপ্রভা অ্যাপয়েন্টমেন্ট ফি এর ২০% টাকা সার্ভিস চার্জ হিসেবে কেটে রাখবে
        </p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="card bg-white shadow-md p-6 rounded-md text-center border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700">
              বুকড অ্যাপয়েন্টমেন্ট
            </h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {appointments.length}
            </p>
          </div>

          <div className="card bg-white shadow-md p-6 rounded-md text-center border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700">মোট আয়</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              ৳ {totalIncome.toFixed(2)}
            </p>
          </div>

          <div className="card bg-white shadow-md p-6 rounded-md text-center border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700">নিট আয় (৮০%)</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              ৳ {netIncome.toFixed(2)}
            </p>
          </div>

          <div className="card bg-white shadow-md p-6 rounded-md text-center border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700">মোট গ্রহণ</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              ৳ {totalReceived.toFixed(2)}
            </p>
          </div>

          <div className="card bg-white shadow-md p-6 rounded-md text-center border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700">মোট বাকি</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">
              ৳ {pending.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Payout History Section */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-gray-800 mb-4 bg-[#EFF7FE] p-3 rounded-md border text-center">
            ইনকাম হিস্টোরি
          </h3>

          <div className="overflow-x-auto bg-white rounded-md shadow-md border border-gray-200">
            <table className="table w-full">
              <thead className="bg-blue-100 text-gray-700">
                <tr>
                  <th>তারিখ</th>
                  <th>রোগীর নাম</th>
                  <th>অ্যাপয়েন্টমেন্ট ফি (৳)</th>
                  <th>চার্জ (২০%)</th>
                  <th>নিট পেমেন্ট (৳)</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-600">
                      কোনো পেমেন্ট রেকর্ড নেই।
                    </td>
                  </tr>
                ) : (
                  appointments.map((app, index) => {
                    const fee = Number(app.fee) || Number(app.consultationFee) || Number(doctor?.consultationFee) || 0;
                    const deduction = fee * 0.2;
                    const net = fee * 0.8;
                    const appointmentDate = app.createdAt || app.date || app.appointmentDate || new Date().toISOString();
                    const displayDate = new Date(appointmentDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });
                    return (
                      <tr key={app._id || index} className="hover:bg-blue-50">
                        <td>{displayDate}</td>
                        <td>{app.patientName || app.name || 'N/A'}</td>
                        <td>৳ {fee.toFixed(2)}</td>
                        <td className="text-red-500">-৳ {deduction.toFixed(2)}</td>
                        <td className="text-green-600 font-semibold">৳ {net.toFixed(2)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
 
        {/* Payment Received History Section */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-gray-800 mb-4 bg-[#EFF7FE] p-3 rounded-md border text-center">
            পেমেন্ট গ্রহণের হিস্টোরি
          </h3>

          <div className="overflow-x-auto bg-white rounded-md shadow-md border border-gray-200">
            <table className="table w-full">
              <thead className="bg-blue-100 text-gray-700">
                <tr>
                  <th>তারিখ</th>
                  <th>মাধ্যম</th>
                  <th>ট্রানজেকশন আইডি</th>
                  <th>এমাউন্ট গ্রহণ (৳)</th>
                  <th>নোট</th>
                </tr>
              </thead>
              <tbody>
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-600">
                      কোনো পেমেন্ট রেকর্ড নেই।
                    </td>
                  </tr>
                ) : (
                  payouts.map((p, i) => (
                    <tr key={p._id || i} className="hover:bg-blue-50">
                      <td className="text-left">{new Date(p.timestamp).toLocaleDateString('en-US')}</td>
                      <td className="text-left">{p.method}</td>
                      <td className="text-left">{p.transactionId}</td>
                      <td className="text-left">৳ {Number(p.amount).toFixed(2)}</td>
                      <td className="text-left">{p.note || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Income;
