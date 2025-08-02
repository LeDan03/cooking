import axios from "axios";

export const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'cooking_unsigned');
    formData.append('cloud_name', 'dkmql9swy');

    try {
        const response = await axios.post(
            'https://api.cloudinary.com/v1_1/dkmql9swy/image/upload',
            formData
        );
        return { "secureUrl": response.data.secure_url, "publicId": response.data.public_id };
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
}