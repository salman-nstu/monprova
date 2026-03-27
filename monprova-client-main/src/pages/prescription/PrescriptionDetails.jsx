import React from "react";
import { FaPrescriptionBottleAlt } from "react-icons/fa";
import useDoctor from "../../hooks/useDoctor";
import { useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useAppointment from "../../hooks/useAppointment";
import usePrescription from "../../hooks/usePrescription";
import Logo from "../../components/Logo";

const PrescriptionDetails = () => {
  const { appointmentId } = useParams();
  const [doctors, refetch] = useDoctor();
  const { user } = useAuth();
  const [appointments] = useAppointment();
  const [prescriptions] = usePrescription();
  const prescription = prescriptions?.find(prescription => prescription.appointmentID === appointmentId)
  const appointment = appointments?.find(appointment => appointment._id === appointmentId)
  // Default to empty object if undefined
  const doctor = doctors?.find(doctor => doctor._id === appointment?.doctorID) || {};

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 text-black border min-h-screen">

      {/* Header */}
      <div className="flex justify-between border-b pb-4">
        <div>
          <h1 className="text-lg font-bold">{doctor.name || "N/A"}</h1>
          <p className="text-sm">{doctor.designation || "N/A"}</p>
          <p className="text-sm">{doctor.degrees || "N/A"}</p>
          <p className="text-sm">{doctor.institute || "N/A"}</p>
          <p className="text-sm">BMDC Reg. No: {doctor.regNo}</p>
        </div>
        <div className="text-sm text-right">
          <p>
            <span className="font-semibold">তারিখ:</span>{" "}
            {new Date(prescription?.updatedAt || prescription?.createdAt)
              .toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
              .replace(/ (\d{4})$/, ", $1")}
          </p>

          <p>
            <span className="font-semibold">Ref:</span> {appointment?._id || "N/A"}
          </p>
        </div>
      </div>

      {/* Patient Info */}
      <div className="grid grid-cols-3 gap-4 text-sm border-b py-3 mt-2">
        <p>
          <span className="font-semibold">রোগীর নাম:</span> {appointment?.patientName || "N/A"}
        </p>
        <p>
          <span className="font-semibold">জেন্ডার:</span> {appointment?.gender === "male" ? "পুরুষ" : appointment?.gender === "female" ? "নারী" : "অন্যান্য"}
        </p>
        <p>
          <span className="font-semibold">বয়স:</span> {appointment?.age || "N/A"} বছর
        </p>

      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6 mt-8">

        {/* Chief Complaints */}
        <div>
          <h2 className="font-semibold mb-2">রোগ নির্ণয়:</h2>
          <p>{prescription?.chiefComplaints || "N/A"}</p>
          <h2 className="font-semibold mb-2 mt-4">টেস্টসমূহ:</h2>
          <p>{prescription?.tests || "N/A"}</p>
        </div>


        {/* Rx Section */}
        <div className="col-span-2 ml-24">
          <div className="flex items-center gap-2 mb-3">

            <h2 className="text-xl font-semibold">Rx</h2>
          </div>

          <div>
            <ol className="list-decimal pl-5 space-y-4 text-sm">
              {prescription?.medications?.map((med, index) => (
                <li key={index}>
                  <p className="font-semibold">{med.name}</p>


                  <p>
                    {med.dosage}
                    {med.instructions && <> &nbsp;&nbsp; {med.instructions}</>}
                    {med.duration && <> &nbsp;&nbsp; {med.duration}</>}
                  </p>
                  <hr className="border-dotted bg-gray-500" />

                </li>
              ))}
            </ol>
          </div>


          <div className="mt-24">
            <div className="mt-8 text-sm font-semibold">
              ফলোআপের সময়: <span className="font-normal">{prescription?.followUp || "N/A"}</span>
            </div>

            {/* Advice */}
            <div className="mt-4">
              <h2 className="font-semibold mb-2">পরামর্শ:</h2>

              <p className="text-sm">{prescription?.advice || "N/A"}</p>

            </div>

            {/* Signature */}
            <div className="mt-24">
              <img src={doctor?.sign} alt="Sign" className="w-48 h-12" />
              <p className="font-semibold">{doctor?.name || "N/A"}</p>
              <p className="text-sm">{doctor?.degrees}</p>

            </div>
          </div>
        </div>
      </div>

      {/* Follow Up */}
         <div className="mt-16 opacity-50">
                <Logo></Logo>
               </div>

    </div>
  );
};

export default PrescriptionDetails;
