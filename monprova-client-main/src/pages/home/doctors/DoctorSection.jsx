import { Link } from "react-router-dom";
import Button from "../../../components/Button";
import DoctorCard from "../../../components/cards/DoctorCard";
import useDoctors from "../../../hooks/useDoctors";

const DoctorSection = () => {
    const [doctors] = useDoctors();
    
    // Filter only verified doctors
    const verifiedDoctors = doctors.filter(doctor => doctor.verificationStatus === 'verified');
    
    return (
        <section id="doctors" className="mt-6">
            <div className="grid grid-cols-3 gap-12 mx-auto px-24">
                {
                    verifiedDoctors.slice(0, 6).map(doctor => <DoctorCard key={doctor.id} doctor={doctor}></DoctorCard>)
                }
            </div>
            
        </section>


    );
};

export default DoctorSection;