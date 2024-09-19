import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ComplaintsList from './component/Complaint/ComplaintsList';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from "./component/Login/Login"
import Navbar from './component/Navbar/Navbar';
import ComplaintForm from './component/Complaint/ComplaintForm';
import { ChakraProvider, extendTheme, CSSReset } from '@chakra-ui/react';
import { AuthProvider } from './component/Login/Permission';
import HomePage from './component/HomePage/HomePage';
import AnswerForm from './component/Answer/AnswerForm';
import ProccedingComplaintForm from './component/ProccedingComplaint/ProccedingComplaintForm';
import AreaForm from './component/Area/AreaForm';
import AreaList from './component/Area/AreaList';
import UpdateProfile from './component/Login/UpdateProfile';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: '#f0f8ff', 
        fontFamily: 'sans-serif',
        margin: 0,
        padding: 0,
      },
      '.HomePage': {  // Añadir una clase específica para HomePage
        bg: 'transparent',
      },
    },
  },
});


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ChakraProvider theme={theme}>
    <CSSReset />
    <Router>
    <AuthProvider>
      <Navbar />
      <div className='container my-4'>
        <Routes>
          <Route exact path="/" element={<HomePage />} />
          <Route  path="/ComplaintsList" element={<ComplaintsList />} />
          <Route  path="/Login" element={<Login />} />
          <Route  path="/ComplaintForm" element={<ComplaintForm />} />
          <Route  path="/ComplaintForm/:id" element={<ComplaintForm />} />
          <Route  path="/answer/:id" element={<AnswerForm />} />
          <Route  path="/proccedingcomplaint/:id" element={<ProccedingComplaintForm />} />
          <Route  path="/AreaList" element={<AreaList />} />
          <Route  path="/AreaForm" element={<AreaForm />} />
          <Route  path="/AreaForm/:id" element={<AreaForm />} />
          <Route  path="/UpdateProfile" element={<UpdateProfile />} />
        </Routes>
        <ToastContainer />
      </div>
    </AuthProvider>
    </Router>
  </ChakraProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
