import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Authorization": `Bearer ${localStorage.getItem('token')}`
    }
})

// Add a response interceptor (convert long AxiosError into short specific error message)
// axiosInstance.interceptors.response.use(
//     (response) => response, // If successful, return response
//     (error) => {
//         // Extract error message
//         const errorMessage = error.response?.data?.errors?.[0]?.msg || "Something went wrong";
//         return Promise.reject(`Error : ${errorMessage}`); // Reject with only the error message
//     }
// );

export default axiosInstance;