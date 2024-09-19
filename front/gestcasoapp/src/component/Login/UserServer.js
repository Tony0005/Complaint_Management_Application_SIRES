import axios from 'axios';

const API_URL = "http://127.0.0.1:8000/gestcasoapp/v1/";

export const listUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}user/`);
        return response.data; 
    } catch (error) {
        console.error('Error fetching user list:', error);
        throw error;
    }
};

export const getUser = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}user/${userId}/`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching user with ID ${userId}:`, error);
        throw error;
    }
};

export const registerUser = async (newUser) => {
    try {
        const response = await axios.post(`${API_URL}register/`, newUser, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}login/`, credentials, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error logging in user:', error);
        throw error;
    }
};

export const updateUser = async (userId, updatedUser) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.put(`http://127.0.0.1:8000/gestcasoapp/v1/user/${userId}/`, updatedUser, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Incluye el token si es necesario
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating user with ID ${userId}:`, error.response ? error.response.data : error);
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await axios.delete(`${API_URL}user/${userId}/`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting user with ID ${userId}:`, error);
        throw error;
    }
};


export const updateUserRole = async (userId, role) => {
    try {
        const response = await axios.patch(`${API_URL}user/${userId}/update_role/`, { role });
        return response.data;
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
};

