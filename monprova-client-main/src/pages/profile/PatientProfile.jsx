import { useState, useEffect } from "react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useUser from "../../hooks/useUser";
import useAuth from "../../hooks/useAuth";
import Swal from "sweetalert2";
import usePatient from "../../hooks/usePatient";
import SectionHeader from '../shared/SectionHeader';

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_API_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

const PatientProfile = () => {
  const axiosSecure = useAxiosSecure(); // (যদি ভবিষ্যতে secure লাগে)
  const axiosPublic = useAxiosPublic();

  const [patients, refetch] = usePatient();
  const [users] = useUser();
  const { user } = useAuth();

  const [isEditable, setIsEditable] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  // ✅ image state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // logged-in user related data
  const patient = users?.find((dbUser) => dbUser.email === user?.email);
  const patientInfo = patients?.find((p) => p.email === user?.email);

  // update select values when patientInfo changes
  useEffect(() => {
    if (patientInfo) {
      setGender(patientInfo.gender || "");
      setBloodGroup(patientInfo.bloodGroup || "");
    }
  }, [patientInfo]);

  // ✅ file change handler
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // save handler
  const handleSave = async (event) => {
    event.preventDefault();

    const form = event.target;

    const name = form.name.value;
    const age = form.age.value;
    const genderValue = form.gender.value;
    const phone = form.phone.value;
    const email = form.email.value;
    const bloodGroupValue = form.bloodGroup.value;
    const address = form.address.value;
    const emergencyContact = form.emergencyContact.value;
    const profession = form.profession.value;

    // Confirm before saving
    const confirmResult = await Swal.fire({
      title: "আপনি কি নিশ্চিত?",
      text: "আপনার প্রোফাইল সংরক্ষণ করতে চান?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "হ্যাঁ, সংরক্ষণ করুন",
      cancelButtonText: "না, বাতিল",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
    });

    if (!confirmResult.isConfirmed) return;

    // Basic validation
    if (!name) {
      return Swal.fire({
        icon: "error",
        title: "ত্রুটি!",
        text: "নাম আবশ্যক।",
        confirmButtonText: "ঠিক আছে",
        confirmButtonColor: "#2563eb",
      });
    }

    try {
      setIsSaving(true);

      // ✅ 1) Upload image to imgbb if selected
      let imageUrl = patientInfo?.image || "";
       Swal.fire({
            title: "সেভ হচ্ছে...",
            text: "অনুগ্রহ করে অপেক্ষা করুন",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
          });

      if (selectedImage) {
        const imageData = new FormData();
        imageData.append("image", selectedImage);

        const imgbbRes = await axiosPublic.post(image_hosting_api, imageData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        imageUrl = imgbbRes?.data?.data?.display_url || imageUrl;
      }

      // ✅ 2) send only URL to backend
      const updatedPatientInfo = {
        name,
        image: imageUrl,
        age,
        gender: genderValue,
        phone,
        email,
        bloodGroup: bloodGroupValue,
        address,
        emergencyContact,
        profession,
      };

      console.log("Updated Patient Info:", updatedPatientInfo);

      // ✅ 3) backend save (আপনার API অনুযায়ী ঠিক করুন)
      await axiosPublic.post("/api/patient", updatedPatientInfo);

      Swal.fire({
        icon: "success",
        title: "✅ প্রোফাইল সংরক্ষণ হয়েছে!",
        text: "আপনার প্রোফাইল সফলভাবে সংরক্ষণ হয়েছে।",
        confirmButtonText: "ঠিক আছে",
        confirmButtonColor: "#2563eb",
      });
      refetch();

      setIsEditable(false);

      // optional reset
      setSelectedImage(null);
      setImagePreview("");
    } catch (err) {
      console.error("Error saving profile:", err);

      let errorMessage = "প্রোফাইল সংরক্ষণ করা যায়নি।";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      Swal.fire({
        icon: "error",
        title: "ত্রুটি!",
        text: errorMessage,
        confirmButtonText: "ঠিক আছে",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-0  mt-0">
      <div className="mx-auto p-6 bg-white rounded-xl">
        <div className="pb-4">
          <SectionHeader
            heading={"রোগীর প্রোফাইল"}
            subHeading={"আপনার প্রোফাইল দেখুন ও এডিট করুন"}
          ></SectionHeader>
        </div>

        {/* ✅ Profile Picture */}
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 rounded-full border-2 overflow-hidden">
            <img
              src={
                imagePreview ||
                patientInfo?.image ||
                patient?.image ||
                "https://via.placeholder.com/150"
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave}>
          {/* ✅ Image Upload */}
          <div className="mt-6 mb-4 flex justify-center">
            <div className="w-full max-w-xs">
              <label className="block text-center mb-2 text-sm font-semibold">
                প্রোফাইল ছবি দিন
              </label>
              <input
                type="file"
                name="image"
                onChange={handleFileChange}
                accept="image/*"
                disabled={!isEditable}
                className="file-input file-input-bordered w-full border-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="label">নাম</label>
              <input
                name="name"
                defaultValue={patientInfo?.name || patient?.name || ""}
                disabled={!isEditable}
                className="input input-bordered w-full border-2 p-2"
              />
            </div>

            <div>
              <label className="label">বয়স</label>
              <input
                name="age"
                defaultValue={patientInfo?.age || ""}
                disabled={!isEditable}
                className="input input-bordered w-full border-2 p-2"
              />
            </div>

            <div>
              <label className="label">জেন্ডার</label>
              <select
                name="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={!isEditable}
                className="select select-bordered w-full border-2 p-2"
              >
                <option value="">নির্বাচন করুন</option>
                <option value="male">পুরুষ</option>
                <option value="female">নারী</option>
                <option value="other">অন্যান্য</option>
              </select>
            </div>

            <div>
              <label className="label">মোবাইল</label>
              <input
                name="phone"
                defaultValue={patientInfo?.phone || ""}
                disabled={!isEditable}
                className="input input-bordered w-full border-2 p-2"
              />
            </div>

            <div>
              <label className="label">ইমেইল</label>
              <input
                type="email"
                name="email"
                defaultValue={patientInfo?.email || patient?.email || ""}
                className="input input-bordered w-full border-2 p-2"
                disabled
              />
            </div>

            <div>
              <label className="label">রক্তের গ্রুপ</label>
              <select
                name="bloodGroup"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                disabled={!isEditable}
                className="select select-bordered w-full border-2 p-2"
              >
                <option value="">নির্বাচন করুন</option>
                {["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">ঠিকানা</label>
              <textarea
                name="address"
                defaultValue={patientInfo?.address || ""}
                disabled={!isEditable}
                className="textarea textarea-bordered w-full border-2 p-2"
              />
            </div>

            <div>
              <label className="label">জরুরি যোগাযোগ</label>
              <input
                name="emergencyContact"
                defaultValue={patientInfo?.emergencyContact || ""}
                disabled={!isEditable}
                className="input input-bordered w-full border-2 p-2"
              />
            </div>

            <div>
              <label className="label">পেশা</label>
              <input
                name="profession"
                defaultValue={patientInfo?.profession || ""}
                disabled={!isEditable}
                className="input input-bordered w-full border-2 p-2"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex justify-center gap-4">
            {!isEditable && (
              <button
                type="button"
                onClick={() => setIsEditable(true)}
                className="btn btn-outline w-full flex gap-2 bg-blue-500 text-white py-4"
              >
                এডিট প্রোফাইল
              </button>
            )}

            {isEditable && (
              <>
                <input
                  type="submit"
                  disabled={isSaving}
                  className="btn bg-primary-color text-white w-1/2 px-8"
                  value={isSaving ? "সেভ হচ্ছে..." : "সংরক্ষণ করুন"}
                />

                <button
                  type="button"
                  onClick={() => {
                    setIsEditable(false);
                    setSelectedImage(null);
                    setImagePreview("");
                    setGender(patientInfo?.gender || "");
                    setBloodGroup(patientInfo?.bloodGroup || "");
                  }}
                  className="btn btn-outline w-1/2 flex gap-2 bg-secondary-color text-white py-4"
                >
                  বাতিল করুন
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientProfile;
