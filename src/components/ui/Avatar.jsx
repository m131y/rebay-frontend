import { useEffect, useState } from "react";
import s3Service from "../../services/s3";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";

const Avatar = ({ user, size = "w-10 h-10" }) => {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const getImage = async () => {
      try {
        const response = await s3Service.getImage(user.profileImageUrl);

        setImageUrl(response.imageUrl);
      } catch (err) {
        console.error(err);
      }
    };

    if (!user.profileImageUrl) return;

    getImage();
  }, [user]);

  return (
    <div
      onClick={() => {
        navigate(`/user/${user.id}`);
        window.location.reload();
      }}
      className={`cursor-pointer flex aspect-square items-center justify-center 
                  shadow-md  overflow-hidden 
                  border border-rebay-gray-300 rounded-full
                  ${size} flex-shrink-0`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          className="rounded-full w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-end justify-center w-full h-full  bg-blue-100">
          <FaUser className="text-rebay-blue h-3/4 w-3/4 opacity-60" />
        </div>
      )}
    </div>
  );
};

export default Avatar;
