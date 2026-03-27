// AppointmentCard.js
import React, { use } from 'react';
import useDoctor from '../../hooks/useDoctor';
import { app } from '../../firebase/firebase.config';
import useAuth from '../../hooks/useAuth';
import usePatient from '../../hooks/usePatient';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import Button from '../Button';
import { Link } from 'react-router-dom';

const PaymentCard = ({ appointment }) => {
    const axiosPublic = useAxiosPublic();
    const { user } = useAuth();
    const [patients] = usePatient();
    const patient = patients.find(pat => pat.email === user?.email);
    const [doctors] = useDoctor();
    const doctor = doctors.find(doc => doc._id === appointment.doctorID);

    const handlePayment = async () => {
        // Simulate payment processing
        const payment = {
            appointmentID: appointment?._id || "",
            email: user?.email,
            doctorID: doctor?._id,
            patientID: appointment?.patientID,
            amount: doctor?.consultationFee || 0,
            transactionId: "",
            date: new Date(),
            status: "pending",
        };

        try {
            // Send payment data to backend for initiating payment
            const response = await axiosPublic.post('/api/sslpayment', payment);

            if (response.data?.gatewayUrl) {
                console.log('Redirecting to payment gateway...');
                // Open the payment gateway URL in a new tab/window
                window.open(response.data.gatewayUrl, '_blank');
            } else {
                console.error('Payment initiation failed: ', response);
            }
        } catch (error) {
            console.error('Error during payment initiation:', error);
        }
    };
    


    return (
        <div
            key={appointment._id}
            className="bg-white shadow-md rounded-xl p-5 border"
        >
            <div className='flex  items-center gap-4 mb-4'>
                <img src={doctor?.image} alt="" className='w-12 h-12 object-cover rounded-full' />
                <div>
                    <h2 className="text-lg font-semibold">
                        {doctor?.name}
                    </h2>
                    <p className='text-black'>{doctor?.designation}</p>
                </div>

            </div>

            <p className="text-gray-600">
                {/* বিভাগ: {appointment.department} */}
            </p>
            <p className="text-gray-600">
                তারিখ: {appointment.createdAt}
            </p>
            <p className="text-gray-600 mb-3">
                সময়: {appointment.createdAt}
            </p>

            <span
                className={`inline-block px-3 py-1 rounded-full text-sm mb-4
                    ${appointment.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
            >
                {appointment.paymentStatus === "paid" ? "Paid" : "Pending Payment"}
            </span>

            <div className="flex gap-3 mt-4">
                <button
                    onClick={handlePayment}
                    className={`flex-1 bg-secondary-color text-white py-2 rounded-lg transition ${appointment.paymentStatus === "paid" ? "opacity-25 text-black cursor-not-allowed bg-gray-500 " : ""
                        }`}
                    disabled={appointment.paymentStatus === "paid"}
                >
                    {appointment.paymentStatus === "paid" ? "পেমেন্ট সম্পন্ন" : "পেমেন্ট করুন"}
                </button>

                <Link to={`/dashboardPatient/appointmentDetailsPatient/${appointment?._id}`}>
                    <Button btnName={"বিস্তারিত দেখুন"} bgColor={"bg-primary-color"} />
                </Link>
            </div>
        </div>
    );
};

export default PaymentCard;

