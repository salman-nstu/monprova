import { Link } from 'react-router-dom';
import Button from '../Button';
import useAuth from '../../hooks/useAuth';

const DoctorCard = ({ doctor }) => {
    const {user} = useAuth()
    const { _id, name, designation, expertise, consultationFee, img, yearsOfExperience, degrees, regNo, institute, image } = doctor;

    return (
        <div className="card bg-base-100 shadow-md border rounded-lg overflow-hidden transform transition-transform hover:scale-105 hover:shadow-lg">
            <div className='flex items-center gap-4 px-4'>
                <figure>
                    <img
                        className="object-cover w-24 h-24 rounded-full mx-auto mt-4"
                        src={image || "https://i.ibb.co.com/zVcdq9PG/1704193051.jpg"}
                        alt={name} />
                </figure>
                <div>
                    <h3 className="card-title font-bold text-lg text-primary-color">{name}</h3>
                    <p className='font-semibold text-tertiary-color text-sm'>{designation}</p>
                    <p className='text-xs text-gray-600'>{institute}</p>
                </div>
            </div>
            <div className="card-body p-4">


                <p className='text-xs text-gray-600'>{degrees}</p>
                <p className='text-xs text-gray-600'>{expertise}</p>
                <div className="badge badge-error text-white bg-secondary-color text-sm mt-2">পরামর্শ ফি: {consultationFee} টাকা</div>
            </div>
            <div className="mb-4 mx-4">
                <Link to={
                    user
                        ? `/dashboardPatient/doctorList/doctorDetails/${_id}`
                        : `/doctorDetails/${_id}`
                }>
                    <Button btnName={"বিস্তারিত দেখুন"} bgColor="bg-blue-500 w-full py-2"></Button>
                </Link>
            </div>
        </div>
    );
};

export default DoctorCard;
