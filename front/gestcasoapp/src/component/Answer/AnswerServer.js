// AnswerServer.js

import axios from 'axios';

const API_URL = "http://127.0.0.1:8000/gestcasoapp/v1/answer/";

export const getAnswersByComplaintId = async (complaintId) => {
    try {
      const response = await axios.get(`${API_URL}?case=${complaintId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching answers for complaint with ID ${complaintId}:`, error);
      throw error;
    }
  };

export const registerAnswer = async (newAnswer) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(API_URL, newAnswer, {
      headers: {
        "Authorization": `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error registering answer:", error);
    throw error;
  }
};
