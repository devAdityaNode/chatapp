import { ArrowLeft, Pencil } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const ProfileView = ({ onBack, user }) => {
  const { updateProfile } = useAuthStore();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
    //   setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="p-4">
      <button onClick={onBack} className="flex items-center text-gray-300 mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <img
            src={user.profilePic || "/avatar.png"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border"
          />
          <label className="absolute bottom-0 right-0 bg-gray-700 p-1 rounded-full cursor-pointer">
            <Pencil className="w-4 h-4 text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
        <h2 className="text-white text-lg mt-2">{user.userName}</h2>
        <p className="text-gray-400 text-sm">{user.email}</p>
      </div>
    </div>
  );
};

export default ProfileView;
