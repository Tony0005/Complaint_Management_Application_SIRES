import { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { FormControl, FormLabel, Textarea, Input, Button, Box, Heading, IconButton, useToast, Text } from "@chakra-ui/react";
import { motion } from 'framer-motion';
import * as AnswerServer from "./AnswerServer";
import AuthContext from "../Login/Permission";
import * as ComplaintServer from "../Complaint/ComplaintServer";
import { FaFileUpload } from 'react-icons/fa';

const AnswerForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const toast = useToast();

  const initialState = { description: "", file_add: [], case: id, author: user ? user.id : null };
  const [answer, setAnswer] = useState(initialState);
  const [complaint, setComplaint] = useState(null);
  const [errors, setErrors] = useState({ description: '' });

  const fetchComplaint = async () => {
    try {
      const data = await ComplaintServer.getComplaint(id);
      setComplaint(data);
    } catch (error) {
      console.error(`Error fetching complaint with ID ${id}:`, error);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleInputChange = (e) => {
    if (e.target.name === 'file_add') {
      setAnswer({ ...answer, file_add: Array.from(e.target.files) });
    } else {
      setAnswer({ ...answer, [e.target.name]: e.target.value });
    }

    if (e.target.name === 'description') {
      setErrors({ ...errors, description: '' });
    }
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

    const descriptionError = validateDescription(answer.description);
    if (descriptionError) {
      setErrors({ description: descriptionError });
      return;
    }

    const formData = new FormData();
    formData.append("description", answer.description);
    formData.append("case", answer.case);
    if (answer.author) {
      formData.append("author", answer.author);
    }

    answer.file_add.forEach((file) => {
      formData.append("file_add", file);
    });

    try {
      await AnswerServer.registerAnswer(formData);
      toast({
        title: "Respuesta enviada.",
        description: "Tu respuesta ha sido enviada con éxito.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      navigate(`/ComplaintsList`);
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      toast({
        title: "Error.",
        description: "Ocurrió un error al enviar tu respuesta.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      maxW="lg"
      mx="auto"
      p="6"
      boxShadow="lg"
      borderRadius="md"
      className="bg-white"
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Heading as="h2" size="lg" mb="6">
        Responder Caso: {complaint ? complaint.title : "Cargando..."}
      </Heading>
      <form onSubmit={handleSubmit}>
        <FormControl mb="4">
          <FormLabel>Descripción:</FormLabel>
          <Textarea
            name="description"
            value={answer.description}
            onChange={handleInputChange}
            placeholder="Escribe tu respuesta..."
            required
            as={motion.textarea}
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
          {errors.description && <Text color="red.500" mt="2">{errors.description}</Text>}
        </FormControl>
        <FormControl mb="4">
          <FormLabel>Adjuntar Archivos:</FormLabel>
          <Box position="relative" overflow="hidden" display="inline-block">
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
          </Box>
        </FormControl>
        <Button
          type="submit"
          colorScheme="blue"
          className="w-full"
          as={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          Enviar Respuesta
        </Button>
      </form>
    </Box>
  );
};

export default AnswerForm;

