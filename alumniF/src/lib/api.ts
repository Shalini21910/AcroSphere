import axios from "axios";

const API_BASE_URL=import.meta.env.VITE_API_BASE_URL||"http://localhost:5000/api";

export const api=axios.create({
    baseURL:API_BASE_URL,
    withCredentials:true,//allow sending cookies or tokens if needed
    headers:{
        "Content-Type":"application/json",
    },
});

//interceptor to attach jwt token automatically
api.interceptors.request.use((config)=>{
    const token=localStorage.getItem("token");// sessionstorage, depending on your login logic
    if(token){
        config.headers.Authorization=`Bearer ${token}`;
    }
    return config;
});
export default api;