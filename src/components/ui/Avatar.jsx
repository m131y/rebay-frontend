import { useEffect, useState } from "react";
import s3Service from "../../services/s3";
import { useNavigate } from "react-router-dom";

const Avatar = ({ user, size = "" }) => {
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
      className={`cursor-pointer flex aspect-square items-center justify-center border-3 shadow border-rebay-gray-200 rounded-full ${size}`}
    >
      <img src={imageUrl} className="rounded-full w-full" />
    </div>
  );
};

export default Avatar;
