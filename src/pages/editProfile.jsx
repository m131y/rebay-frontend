import {
  FiAtSign,
  FiPlus,
  FiSave,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import MainLayout from "../components/layout/MainLayout";
import Avatar from "../components/ui/Avatar";
import Input from "../components/ui/Input";
import useUserStore from "../store/userStore";
import { useNavigate, useParams } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { useEffect, useState } from "react";
import EditPassword from "../components/auth/editPassword";
import FileUpload from "../components/file/fileUpload";
import s3Service from "../services/s3";

const EditProfile = () => {
  const { targetUserId } = useParams();
  const { user } = useAuthStore();
  const { userProfile, getUserProfile, updateProfile, error } = useUserStore();

  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    bio: "",
    profileImageUrl: "",
    enabled: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        await getUserProfile(targetUserId);
      } catch (err) {
        console.error(err);
      }
    };
    loadUserProfile();
  }, [getUserProfile, targetUserId]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        username: userProfile.username || "",
        email: userProfile.email || "",
        fullName: userProfile.fullName || "",
        bio: userProfile.bio || "",
        profileImageUrl: userProfile.profileImageUrl || "",
        enabled: userProfile.enabled ?? true,
      });
    }
  }, [userProfile]);

  const isOwnProfile = userProfile?.username === user?.username;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleEnabled = () => {
    setFormData((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  const handleFileUploadClose = (newImageUrl) => {
    setShowFileUpload(false);

    if (newImageUrl) {
      setFormData((prev) => ({
        ...prev,
        profileImageUrl: newImageUrl,
      }));
    } else {
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(formData);
      alert("프로필 정보가 성공적으로 저장되었습니다.");
    } catch (error) {
      alert("프로필 저장에 실패했습니다.");
      alert(error);
    } finally {
      setIsSaving(false);
    }
  };

  const avatarUser = userProfile
    ? {
        ...userProfile,
        profileImageUrl: formData.profileImageUrl,
      }
    : null;

  return (
    <MainLayout>
      <Header />
      {userProfile && (
        <main className="w-full flex-grow flex flex-col items-center mt-[70px] py-10">
          <div className="font-presentation flex items-center w-[990px]">
            <form onSubmit={handleSubmit}>
              <div className="w-[990px] flex justify-between">
                <div className="mr-10">
                  {avatarUser && (
                    <>
                      <button
                        onClick={() => setShowFileUpload(true)}
                        type="button"
                        className="cursor-pointer absolute m-4 size-13 flex items-center text-white justify-center rounded-full bg-rebay-blue z-10"
                      >
                        <FiPlus size={30} />
                      </button>
                      <Avatar user={avatarUser} size="size-[300px]" />
                    </>
                  )}
                </div>
                <div className="font-presentation space-y-4 text-2xl flex w-full flex-col items-center ">
                  <div className="flex w-full items-center">
                    <label
                      htmlFor="username"
                      className="w-28 sm:w-32 mr-4 text-xl text-gray-700 font-semibold text-right"
                    >
                      username :
                    </label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      minlength="2"
                      onChange={handleChange}
                      className="text-xl"
                      placeholder={userProfile.username}
                      required
                    />
                  </div>
                  <div className="flex w-full items-center">
                    <label
                      htmlFor="email"
                      className="w-28 sm:w-32 mr-4 text-xl text-gray-700 font-semibold text-right"
                    >
                      email :
                    </label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="text-xl"
                      placeholder={userProfile.email}
                      required
                    />
                  </div>
                  <div className="flex w-full items-center">
                    <label
                      htmlFor="fullName"
                      className="w-28 sm:w-32 mr-4 text-xl text-gray-700 font-semibold text-right"
                    >
                      fullName :
                    </label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="text-xl"
                      placeholder={userProfile.fullName}
                      required
                    />
                  </div>
                  <div className="flex justify-start">
                    <div className="w-[450px]"></div>
                    <div
                      onClick={() => setShowUpdatePassword(true)}
                      className="flex cursor-pointer items-center justify-center border border-gray-400 w-[200px] rounded-full"
                    >
                      비밀번호 변경
                    </div>
                  </div>
                </div>
              </div>
              <div className="font-presentation mt-10  text-xl">
                <div className="w-full font-semibold">
                  bio :
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="text-2xl p-4 resize-none w-full rounded-xl bg-gray-50/50 border border-gray-200 h-[200px] focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 transition-all"
                    rows="5"
                    placeholder={userProfile.bio}
                  />
                </div>
              </div>
              <div className="flex mt-[50px] mb-[30px] justify-center">
                <button
                  type="submit"
                  className={`
                        cursor-pointer bg-rebay-blue hover:bg-blue-700 text-white text-xl font-bold 
                        rounded-full w-40 h-12 flex items-center justify-center shadow-lg transition-all 
                        ${isSaving ? "opacity-70 cursor-not-allowed" : ""}
                    `}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent border-solid rounded-full animate-spin mr-2"></div>
                      저장 중...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-5 h-5 mr-2" /> 저장
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      )}

      {showUpdatePassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <EditPassword onClose={() => setShowUpdatePassword(false)} />
        </div>
      )}

      {showFileUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <FileUpload user={userProfile} onClose={handleFileUploadClose} />
        </div>
      )}

      <Footer />
    </MainLayout>
  );
};
export default EditProfile;
