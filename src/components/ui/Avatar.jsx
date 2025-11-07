import { useEffect, useState } from "react";
import s3Service from "../../services/s3";

const Avatar = ({ user, size = "" }) => {
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
      className={`flex items-center justify-center border-5 border-gray-300 rounded-full ${size}`}
    >
      <img src={imageUrl} className="rounded-full w-full" />
    </div>
  );
};

export default Avatar;
