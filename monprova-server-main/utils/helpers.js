const getDayFromDateString = (dateStr) => {
  // dateStr format: "YYYY-MM-DD"
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
};

const parseTime12to24 = (timeString) => {
  const [time, period] = timeString.trim().split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let hour24 = hours;
  if (period === 'PM' && hours !== 12) hour24 += 12;
  if (period === 'AM' && hours === 12) hour24 = 0;
  return { hours: hour24, minutes };
};

const formatDateBengali = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("bn-BD", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  } catch (error) {
    return dateString; // Fallback to original if parsing fails
  }
};

module.exports = { getDayFromDateString, parseTime12to24, formatDateBengali };
