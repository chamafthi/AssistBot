import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/chat/";

// Function to send a message (with optional file)
export const sendMessage = async (message: string, file?: File) => {
    const formData = new FormData();
    formData.append("message", message);

    // Append file if provided
    if (file) {
        formData.append("file", file);
    }

    try {
        // Send the request to the backend
        const response = await axios.post(API_URL, formData, {
            headers: {
                "Content-Type": "multipart/form-data", // Ensure it's multipart/form-data
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};
