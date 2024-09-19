import axios from 'axios';

const API_URL = "http://127.0.0.1:8000/gestcasoapp/v1/proceeding_complaint/";

export const getProccedingComplaintByComplaintId = async (complaintId) => {
    try {
      const response = await axios.get(`${API_URL}?case=${complaintId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching procceding complaint for complaint with ID ${complaintId}:`, error);
      throw error;
    }
  };

export const registerProccedingComplaint = async (newProccedingComplaint) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(API_URL, newProccedingComplaint, {
      headers: {
        "Authorization": `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error registering procceding complaint:", error);
    throw error;
  }
};
