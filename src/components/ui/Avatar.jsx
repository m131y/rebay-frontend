import useAuthStore from "../../store/authStore";

const Avatar = ({ size = "" }) => {
  const { user } = useAuthStore();
  return (
    <div
      className={`flex items-center justify-center border-5 border-gray-300 rounded-full ${size}`}
    >
      <img src={user.profileImageUrl} className="rounded-full w-full" />
    </div>
  );
};

export default Avatar;
