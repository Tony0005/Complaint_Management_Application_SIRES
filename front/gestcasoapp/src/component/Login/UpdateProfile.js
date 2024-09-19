import React, { useState, useContext, useEffect } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Stack, Heading, Text, useToast } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import AuthContext from './Permission'; 
import * as UserServer from "./UserServer";

const UpdateProfile = () => {
  const { user } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const toast = useToast();
  const [errors, setErrors] = useState({ name: '' });

  useEffect(() => {
    if (user) {
      setName(user.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const validateName = (name) => {
    const regex = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s\W]+$/;
    if (!regex.test(name)) {
      return 'El nombre de usuario debe contener al menos una letra y no puede estar compuesto solo de números o signos.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameError = validateName(name);
    if (nameError) {
      setErrors(prevState => ({ ...prevState, name: nameError }));
      return;
    } else {
      setErrors(prevState => ({ ...prevState, name: '' }));
    }

    const updatedUser = {
      email, 
      username: name, 
      password, 
      new_password: newPassword 
    };

    try {
      await UserServer.updateUser(user.id, updatedUser);
      toast({
        title: 'Perfil actualizado',
        description: 'Tu perfil ha sido actualizado con éxito.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      console.log(updatedUser);
    } catch (error) {
      console.error('Error al actualizar el perfil:', error.response ? error.response.data : error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al actualizar el perfil.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      className="bg-white"
      maxW="lg"
      mx="auto"
      p="6"
      boxShadow="lg"
      borderRadius="md"
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Heading as="h2" size="lg" mb="6" textAlign="center">
        Actualizar Perfil
      </Heading>

      <form onSubmit={handleSubmit}>
        <Stack spacing={4} mb="4">
          <FormControl id="name" isRequired>
            <FormLabel>Nombre de usuario</FormLabel>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              as={motion.input}
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            />
            {errors.name && <Text color="red.500" mt="2">{errors.name}</Text>}
          </FormControl>

          <FormControl id="email" isRequired>
            <FormLabel>Correo electrónico</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              as={motion.input}
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            />
          </FormControl>

          <FormControl id="password">
            <FormLabel>Contraseña actual</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              as={motion.input}
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            />
          </FormControl>

          <FormControl id="newPassword">
            <FormLabel>Contraseña nueva</FormLabel>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              as={motion.input}
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            />
          </FormControl>
        </Stack>

        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          as={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          Actualizar Perfil
        </Button>
      </form>
    </Box>
  );
};

export default UpdateProfile;


