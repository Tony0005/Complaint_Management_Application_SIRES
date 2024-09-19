import axios from 'axios';

const API_URL = "http://127.0.0.1:8000/gestcasoapp/v1/area/";

export const getArea = async (areaId) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}${areaId}/`, {
            headers: {
                "Authorization": `Token ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching area with ID ${areaId}:`, error);
        throw error;
    }
};

export const registerArea = async (newArea) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(API_URL, newArea, {
        headers: {
          "Authorization": `Token ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error registering area:", error);
      throw error;
    }
};

export const updateArea = async (id, updatedArea) => {  
    try {  
        const token = localStorage.getItem("token");  
        const response = await axios.put(`${API_URL}${id}/`, updatedArea, {  
            headers: {  
                "Authorization": `Token ${token}`,  
                'Content-Type': 'application/json' 
            }  
        });  
        return response.data;  
    } catch (error) {  
        console.error("Error updating area:", error);  
        throw error;  
    }  
};

export const deleteArea = async (areaId) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.delete(`${API_URL}${areaId}/`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error deleting area with ID ${areaId}:`, error);
        throw error;
    }
};

export const listAreas = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(API_URL, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching areas:", error);
    throw error;
  }
};


export const getAllAreaMembers = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}members/`, {
      headers: {
        "Authorization": `Token ${token}`
      }
    });
    return response.data; // Devolvemos todos los datos de los miembros
  } catch (error) {
    console.error('Error fetching all area members:', error);
    throw error;
  }
};