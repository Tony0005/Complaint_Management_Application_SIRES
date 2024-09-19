import axios from 'axios';

const API_URL = "http://127.0.0.1:8000/gestcasoapp/v1/complaint/";

export const ListComplaint = async () => {
    try {
        const token = localStorage.getItem("token");
        const isAdmin = localStorage.getItem("role") === "admin";
        console.log("Role from localStorage:", isAdmin);
        console.log(localStorage.getItem("role") );
        let url = API_URL;

        if (isAdmin) {
            url += 'all_complaints/';  
        } else {
            url += 'my_complaints/';  
        }

        const response = await axios.get(url, {
            headers: {
                "Authorization": `Token ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching complaints list:', error);
        throw error;
    }
};

export const getComplaint = async (complaintId) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}${complaintId}/`, {
            headers: {
                "Authorization": `Token ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching complaint with ID ${complaintId}:`, error);
        throw error;
    }
};

export const registerComplaint = async (newComplaint) => {
    try {
        const token = localStorage.getItem("token");
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};
        const res = await fetch(API_URL, {
            method: "POST",
            body: newComplaint,
            headers: headers
        });
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error registering complaint:", error);
        throw error;
    }
};

export const updateComplaint = async (id, formData) => {
    try {
        const token = localStorage.getItem("token");

        const response = await axios.put(`${API_URL}${id}/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        });
        console.log([...formData]);
        return response.data;
    } catch (error) {
        // Manejo de errores detallado
        if (error.response) {
            console.error('Error del servidor:', error.response.data);
            throw new Error(error.response.data.detail || 'Error al actualizar la queja');
        } else if (error.request) {
            console.error('Error de solicitud:', error.request);
            throw new Error('Error de solicitud');
        } else {
            console.error('Error:', error.message);
            throw new Error(error.message);
        }
    }
};

export const deleteComplaint = async (complaintId) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.delete(`${API_URL}${complaintId}/`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error deleting complaint with ID ${complaintId}:`, error);
        throw error;
    }
};

export const getComplaintByIdentificationNumber = async (identificationNumber) => {
    try {
        const response = await axios.get(`${API_URL}?identification_number=${identificationNumber}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching complaint with identification number ${identificationNumber}:`, error);
        throw error;
    }
};

export const assignComplaint = async (complaintId, assignData) => {
    try {
      const response = await axios.put(`${API_URL}${complaintId}/assign_complaint/`, assignData);
      return response.data; // Asegúrate de que esto contenga { success: true/false, ... }
    } catch (error) {
      console.error('Error en la asignación:', error);
      throw error; // Re-lanza el error para manejarlo en el catch
    }
  };

  export const assignMultipleUsers = async (complaintId, userIds) => {
    try {
        const response = await axios.put(`${API_URL}${complaintId}/assign_multiple_users/`, { users: userIds });
        return response.data; // Asegúrate de que esto contenga { success: true/false, ... }
    } catch (error) {
        console.error('Error en la asignación múltiple:', error);
        throw error; // Re-lanza el error para manejarlo en el catch
    }
};


export const updateComplaintStatus = async (complaintId, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_URL}${complaintId}/update_status/`,
        { status },
        {
          headers: {
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el estado de la queja:', error);
      throw error;
    }
  };

export const assignDeadline = async (complaintId, deadlineData) => {
    try {
      const response = await axios.put(`${API_URL}${complaintId}/assign_deadline/`, deadlineData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };  