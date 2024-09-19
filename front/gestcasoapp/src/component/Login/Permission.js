import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as UserServer from './UserServer';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      setUser(null);
      setToken(null);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const data = await UserServer.loginUser({ email, password });
      console.log('Respuesta del servidor:', data); 
  
      if (data && data.token && data.user_id && data.email) {
        const user = {
          id: data.user_id,
          email: data.email,
          role: data.role, 
        };
        setUser(user);
        setToken(data.token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', data.token);
        navigate('/ComplaintsList');
        setMessage('Bienvenido');
        return { user, token: data.token, message: 'Bienvenido' };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error en el login:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await UserServer.registerUser(userData);
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      navigate('/');
      setMessage('Usuario creado con éxito');
      return { user: data.user, token: data.token, message: 'Usuario creado con éxito' };
    } catch (error) {
      console.error('Error en el registro:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, message }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
