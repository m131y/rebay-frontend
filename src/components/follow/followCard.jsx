import { useEffect } from "react";
import useAuthStore from "../../store/authStore";
import useFollowStore from "../../store/followStore";
import Avatar from "../ui/Avatar";
import useUserStore from "../../store/userStore";

const FollowCard = ({ user, onFollowToggleSuccess }) => {
  const { user: currentUser } = useAuthStore();
  const { toggleFollow } = useFollowStore();

  const handleToggleFollow = async () => {
    await toggleFollow(user.id);
    if (onFollowToggleSuccess) {
      onFollowToggleSuccess();
    }
  };

  const isOwnProfile = user?.id === currentUser?.id;

  return (
    <div className="flex items-center mt-5 w-full ">
      <div className="font-presentation text-xl flex h-[150px] w-[990px] border-b-1 border-rebay-gray-200">
        <Avatar size="size-30" user={user} />
        <div className="w-full flex justify-between px-4 text-rebay-gray-700">
          <div className="">
            <div className="text-2xl">{user.username}</div>
            <div>{user.email}</div>
            <div>{user.fullName}</div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex justify-end">
              {!isOwnProfile ? (
                user.following ? (
                  <button
                    onClick={handleToggleFollow}
                    className="cursor-pointer w-[120px] h-[40px] text-lg rounded-xl shadow-sm hover:shadow-lg font-bold text-white bg-rebay-gray-400 transition-all  duration-200 hover:opacity-90"
                  >
                    unfollow
                  </button>
                ) : (
                  <button
                    onClick={handleToggleFollow}
                    className="cursor-pointer w-[120px] h-[40px] text-lg rounded-xl shadow-sm hover:shadow-lg font-bold text-white bg-rebay-blue transition-all  duration-200 hover:opacity-90"
                  >
                    follow +
                  </button>
                )
              ) : (
                <div></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowCard;
