import { useState } from "react";

const fallbackImage = "https://res.cloudinary.com/dkmql9swy/image/upload/v1747635769/asian-food-traditional-restaurants-cooking-menu-vector-illustration_629712-192_zzr6qj.jpg";

const ImageWithFallback = ({ src, alt, classname }) => {
    const [imgSrc, setImgSrc] = useState(src || fallbackImage);
    const handleError = (e) => {
        setImgSrc(fallbackImage);
    };

    return <img src={imgSrc} alt={alt} className={`object-cover ${classname}`} onError={handleError} style={{ minHeight: '160px', display: 'block' }} />
}

export default ImageWithFallback;