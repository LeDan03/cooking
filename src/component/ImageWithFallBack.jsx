import { useState } from "react";

const fallbackImage = "https://res.cloudinary.com/dkmql9swy/image/upload/v1747635769/asian-food-traditional-restaurants-cooking-menu-vector-illustration_629712-192_zzr6qj.jpg";

const ImageWithFallback = ({ src, alt, className }) => {
  const [imgSrc, setImgSrc] = useState(src|| fallbackImage);
  const handleError = () => setImgSrc(fallbackImage);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={`object-cover ${className}`}
      onError={handleError}
      style={{ display: 'block' }}
    />
  );
};

const fallbackUserImage = "https://res.cloudinary.com/dkmql9swy/image/upload/v1750048115/689pIkbEsT3xi_md3zt5.webp";

export const UserImageFallBack = ({ src, alt, className }) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackUserImage);
  const handleError = () => setImgSrc(fallbackUserImage);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={`object-cover ${className}`}
      onError={handleError}
      style={{ display: 'block' }}
    />
  );
}

export default ImageWithFallback;
