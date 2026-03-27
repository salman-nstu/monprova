// Prescription.js
import React, { useEffect, useState } from "react";
 // Import the new PrescriptionCard component
import usePrescription from "../../hooks/usePrescription";
import usePatient from "../../hooks/usePatient";
import useAuth from "../../hooks/useAuth";
import PrescriptionCard from "../../components/cards/PrescriptionCard";
import SectionHeader from "../shared/SectionHeader";

const Prescription = () => {
  const [prescriptions] = usePrescription();
  const [patients] = usePatient();
  const {user} = useAuth();
  const patient = patients?.find(patient => patient.email === user?.email);
 
  
  const prescription = prescriptions
  ?.filter(p => p.patientID === patient?._id)
  ?.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  

  return (
    <div>
      <div className="min-h-[850px] rounded-lg mt-0 p-0">
       <div className="mb-12">
        <SectionHeader heading={"আপনার প্রেসক্রিপশনসমুহ"} subHeading={"আপনার প্রেসক্রিপশন গুলো এখানে দেখুন"}></SectionHeader>
       </div>

        {prescription.length === 0 ? (
          <p className="text-center text-lg text-gray-600">
            এখনো কোনো প্রেসক্রিপশন পাওয়া যায়নি।
          </p>
        ) : (
          <div className="grid grid-cols-3 lg:grid-cols-3 gap-6">
            {prescription.map((prescription, index) => (
              <PrescriptionCard key={index} prescription={prescription} patient ={patient} /> // Use PrescriptionCard to render each item
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescription;