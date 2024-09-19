import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import * as ComplaintServer from "./ComplaintServer";
import AuthContext from "../Login/Permission";
import { Box, Button, Input, FormControl, FormLabel, Textarea, Heading, Alert, AlertIcon, IconButton, Stack, Text } from '@chakra-ui/react';
import { FaFileUpload } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ComplaintForm = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const initialState = { title: "", description: "", file_add: [], status: 'en espera', date: new Date(), user: user ? user.id : null };
  const [complaint, setComplaint] = useState(initialState);
  const [alert, setAlert] = useState({ show: false, identificationNumber: '' });
  const [errors, setErrors] = useState({ description: '' }, { title: '' });

  useEffect(() => {
    if (id) {
      const loadComplaint = async () => {
        try {
          const data = await ComplaintServer.getComplaint(id);
          setComplaint({ 
            ...data, 
            user: data.user.id, 
            date: new Date(data.date), 
            file_add: data.attachments.map(attachment => ({
              file: attachment.file_add,
              newFile: false,
            })) || []
          });
        } catch (error) {
          console.error("Error al cargar la queja:", error);
        }
      };
      loadComplaint();
    }
  }, [id]);

  const handleInputChange = (e) => {
    if (e.target.name === 'file_add') {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        newFile: true,
      }));
      setComplaint({ ...complaint, file_add: [...complaint.file_add, ...newFiles] });
    } else {
      setComplaint({ ...complaint, [e.target.name]: e.target.value });
    }

    if (e.target.name === 'title') {
      setErrors({ ...errors, title: '' });
    }

    if (e.target.name === 'description') {
      setErrors({ ...errors, description: '' });
    }
  };

  const validateTitle = (title) => {
    const regex = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s\W]+$/;
    if (!regex.test(title)) {
      return 'El título debe contener al menos una letra y no puede estar compuesta solo de números o signos.';
    }
    return '';
  };

  const validateDescription = (description) => {
    const regex = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s\W]+$/;
    if (!regex.test(description)) {
      return 'La descripción debe contener al menos una letra y no puede estar compuesta solo de números o signos.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const titleError = validateTitle(complaint.title);
    if (titleError) {
      setErrors({ title: titleError });
      return;
    }

    const descriptionError = validateDescription(complaint.description);
    if (descriptionError) {
      setErrors({ description: descriptionError });
      return;
    }

    const formData = new FormData();
    formData.append("title", complaint.title);
    formData.append("description", complaint.description);
    formData.append("status", complaint.status);
    formData.append('date', new Date(complaint.date).toISOString().slice(0, 10));

    if (complaint.user) {
      formData.append('user', complaint.user);
    }

    complaint.file_add.forEach((fileObj) => {
      if (fileObj.newFile) {
        formData.append("file_add", fileObj.file);
      }
    });

    try {
      if (id) {
        await ComplaintServer.updateComplaint(id, formData);
        navigate('/ComplaintsList');
      } else {
        const response = await ComplaintServer.registerComplaint(formData);
        setAlert({ show: true, identificationNumber: response.data.identification_number });
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    }
  };

  return (
    <Box maxW="lg" mx="auto" p="6" bg="white" borderRadius="md" boxShadow="lg">
      <Heading as="h2" size="lg" mb="6" textAlign="center" color="teal.500">
        {id ? "Editar Caso" : "Registrar Caso"}
      </Heading>

      {alert.show && (
        <Alert status="success" mb="6">
          <AlertIcon />
          ¡Caso registrado con éxito! Número de identificación: {alert.identificationNumber}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <FormControl mb="4" isRequired>
          <FormLabel>Título</FormLabel>
          <Input
            name="title"
            value={complaint.title}
            onChange={handleInputChange}
            placeholder="Escribe el título del caso"
            variant="filled"
            focusBorderColor="teal.400"
          />
          {errors.title && <Text color="red.500" mt="2">{errors.title}</Text>}
        </FormControl>

        <FormControl mb="4" isRequired>
          <FormLabel>Descripción</FormLabel>
          <Textarea
            name="description"
            value={complaint.description}
            onChange={handleInputChange}
            placeholder="Escribe la descripción del caso"
            variant="filled"
            focusBorderColor="teal.400"
          />
          {errors.description && <Text color="red.500" mt="2">{errors.description}</Text>}
        </FormControl>

        <FormControl mb="4">
          <FormLabel>Adjuntar archivos</FormLabel>
          {complaint.file_add && complaint.file_add.map((fileObj, index) => (
            <Box key={index} mb="2">
              {!fileObj.newFile ? (
                <a href={fileObj.file} target="_blank" rel="noopener noreferrer">
                  Ver archivo {index + 1}
                </a>
              ) : (
                <span>{fileObj.file.name}</span>
              )}
            </Box>
          ))}
          <Stack direction="row" align="center">
            <Input
              type="file"
              name="file_add"
              onChange={handleInputChange}
              accept=".pdf,.doc,.docx,.jpg,.png"
              multiple
              display="none"
              id="file-upload"
            />
            <FormLabel htmlFor="file-upload" mb="0">
              <IconButton
                as="span"
                icon={<FaFileUpload />}
                colorScheme="teal"
                variant="outline"
                aria-label="Subir archivos"
                _hover={{ bg: "teal.100" }}
                transition="all 0.2s"
              />
            </FormLabel>
          </Stack>
        </FormControl>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button type="submit" colorScheme="teal" width="full">
            {id ? "Editar Caso" : "Registrar Caso"}
          </Button>
        </motion.div>
      </form>
    </Box>
  );
};

export default ComplaintForm;

