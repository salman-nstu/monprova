import React, { useState, useEffect } from 'react';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import useDoctor from '../../hooks/useDoctor';
import useAuth from '../../hooks/useAuth';
import useSchedule from '../../hooks/useSchedule';
import SectionHeader from '../shared/SectionHeader';
import Swal from 'sweetalert2';

const DoctorSchedule = () => {
  const axiosPublic = useAxiosPublic();
  const [doctors] = useDoctor();
  const { user } = useAuth();
  const doctor = doctors.find(doc => doc.email === user?.email);
  const doctorID = doctor?._id;

  // 🔥 DEFAULT MEDIUM FIX
  const medium = doctor?.medium || 'both';

  const [schedules, refetch] = useSchedule();
  const schedule = schedules.find(sch => sch.doctorID === doctorID);

  const [availability, setAvailability] = useState({
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  });

  const [selectedDay, setSelectedDay] = useState(null);
  const [onlineOffline, setOnlineOffline] = useState('online');
  const [appointments, setAppointments] = useState([]);

  // Auto select today
  useEffect(() => {
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    setSelectedDay(days[new Date().getDay()]);
  }, []);

  // Fetch appointments to mark booked slots
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!doctorID) return;
      try {
        const res = await axiosPublic.get('/api/appointments');
        const myAppointments = res.data.filter(apt => 
          apt.doctorID === doctorID && 
          apt.paymentStatus === 'paid' &&
          apt.state !== 'completed' &&
          apt.state !== 'cancelled'
        );
        setAppointments(myAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };
    fetchAppointments();
  }, [doctorID, axiosPublic]);

  // Load saved schedule and sync with booked appointments
  useEffect(() => {
    if (schedule?.availability) {
      const updatedAvailability = { ...schedule.availability };
      
      // Mark slots as booked based on actual appointments
      appointments.forEach(apt => {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const appointmentDate = new Date(apt.appointmentDate);
        const dayKey = days[appointmentDate.getDay()];
        
        if (updatedAvailability[dayKey]) {
          const slotIndex = updatedAvailability[dayKey].findIndex(s => s.time === apt.slot);
          if (slotIndex !== -1) {
            updatedAvailability[dayKey][slotIndex].status = 'booked';
          } else {
            // If slot doesn't exist in schedule, add it as booked
            updatedAvailability[dayKey].push({
              time: apt.slot,
              type: apt.mode || 'online',
              status: 'booked'
            });
          }
        }
      });
      
      setAvailability(updatedAvailability);
    }
  }, [schedule, appointments]);

  const dayNamesInBangla = {
    sunday: 'রবিবার',
    monday: 'সোমবার',
    tuesday: 'মঙ্গলবার',
    wednesday: 'বুধবার',
    thursday: 'বৃহস্পতিবার',
    friday: 'শুক্রবার',
    saturday: 'শনিবার',
  };

  const timeSlots = [
    '09:00 AM - 09:30 AM','09:30 AM - 10:00 AM',
    '10:00 AM - 10:30 AM','10:30 AM - 11:00 AM',
    '11:00 AM - 11:30 AM','11:30 AM - 12:00 PM',
    '12:00 PM - 12:30 PM','12:30 PM - 01:00 PM',
    '01:00 PM - 01:30 PM','01:30 PM - 02:00 PM',
    '02:00 PM - 02:30 PM','02:30 PM - 03:00 PM',
    '03:00 PM - 03:30 PM','03:30 PM - 04:00 PM',
    '04:00 PM - 04:30 PM','04:30 PM - 05:00 PM',
    '05:00 PM - 05:30 PM','05:30 PM - 06:00 PM',
    '06:00 PM - 06:30 PM','06:30 PM - 07:00 PM',
    '07:00 PM - 07:30 PM','07:30 PM - 08:00 PM',
    '08:00 PM - 08:30 PM','08:30 PM - 09:00 PM'
  ];

  const handleSlotClick = (slot) => {
    if (!selectedDay) return;

    // Medium restriction
    if (medium === 'online' && onlineOffline !== 'online') return;
    if (medium === 'offline' && onlineOffline !== 'offline') return;

    setAvailability(prev => {
      const updated = [...prev[selectedDay]];
      const index = updated.findIndex(s => s.time === slot);

      if (index > -1) {
        if (updated[index].status === 'booked') return prev;

        if (updated[index].type === onlineOffline) {
          updated.splice(index, 1);
        } else {
          updated[index] = { ...updated[index], type: onlineOffline };
        }
      } else {
        updated.push({
          time: slot,
          type: onlineOffline,
          status: 'available',
        });
      }

      return { ...prev, [selectedDay]: updated };
    });
  };

  const handleSave = async () => {
    try {
      await axiosPublic.post('/api/saveSchedule', {
        doctorID,
        availability,
      });

      Swal.fire({
        icon: 'success',
        title: 'শিডিউল সফলভাবে সেভ হয়েছে',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'শিডিউল সেভ করা যায়নি',
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <SectionHeader
        heading="ডাক্তারের সাপ্তাহিক শিডিউল"
        subHeading="আপনার শিডিউল সেট করুন"
      />

      {/* Day selection */}
      <div className="flex gap-3 my-6 flex-wrap">
        {Object.keys(dayNamesInBangla).map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded ${
              selectedDay === day ? 'bg-red-400 text-white' : 'bg-gray-200'
            }`}
          >
            {dayNamesInBangla[day]}
          </button>
        ))}
      </div>

      {selectedDay && (
        <>
          {/* Mode buttons */}
          <div className="flex gap-4 mb-4">
            {(medium === 'online' || medium === 'both') && (
              <button
                onClick={() => setOnlineOffline('online')}
                className={`px-4 py-2 rounded ${
                  onlineOffline === 'online'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                অনলাইন
              </button>
            )}

            {(medium === 'offline' || medium === 'both') && (
              <button
                onClick={() => setOnlineOffline('offline')}
                className={`px-4 py-2 rounded ${
                  onlineOffline === 'offline'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                অফলাইন
              </button>
            )}
          </div>

          {/* Indicators */}
          <div className="flex flex-wrap gap-6 items-center mb-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-blue-500"></span>
              <span>অনলাইন</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-green-500"></span>
              <span>অফলাইন</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-red-500"></span>
              <span>বুকড</span>
            </div>
          </div>

          {/* Slots */}
          <div className="grid grid-cols-4 gap-4">
            {timeSlots.map(slot => {
              const slotData = availability[selectedDay].find(s => s.time === slot);

              const disabledByMedium =
                (medium === 'online' && onlineOffline === 'offline') ||
                (medium === 'offline' && onlineOffline === 'online');

              let style = 'bg-white hover:bg-gray-100';
              if (slotData?.status === 'booked') style = 'bg-red-500 text-white';
              else if (slotData?.type === 'online') style = 'bg-blue-500 text-white';
              else if (slotData?.type === 'offline') style = 'bg-green-500 text-white';
              else if (disabledByMedium) style = 'bg-gray-300 text-gray-500 cursor-not-allowed';

              return (
                <button
                  key={slot}
                  disabled={slotData?.status === 'booked' || disabledByMedium}
                  onClick={() => handleSlotClick(slot)}
                  className={`px-3 py-2 rounded border ${style}`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </>
      )}

      <button
        onClick={handleSave}
        className="mt-6 bg-blue-500 text-white px-6 py-2 rounded"
      >
        শিডিউল সেভ করুন
      </button>
    </div>
  );
};

export default DoctorSchedule;
