import axios from "axios";

export const uploadImage = async (image, accessToken) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_SERVER_DOMAIN}/get-upload-url`,
      {
        headers: {
          Authorization: `${accessToken}`,
        },
      }
    );
    const { uploadURL } = response.data;

    await axios.put(uploadURL, image, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return uploadURL.split("?")[0];
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};
