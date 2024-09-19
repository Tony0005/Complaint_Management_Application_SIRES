
import React, { useState, useContext } from 'react';
import { Flex, Box, FormControl, FormLabel, Input, InputGroup, Stack, Button, Heading, Text, useColorModeValue, Link, InputRightElement } from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import AuthContext from './Permission';
import { motion } from 'framer-motion';

const AuthComponent = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');

  const { login, register } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = { username, email, password };

    try {
      if (isLogin) {
        const res = await login(email, password);
        console.log('Token creado:', res.token);
        localStorage.setItem('token', res.token);
        console.log('User state changed:', res.user); 
        localStorage.setItem('role', res.user.role);
        setMessage('Bienvenido');
      } else {
        const res = await register(userData);
        console.log('Token creado:', res.token);
        localStorage.setItem('token', res.token);
        console.log('User state changed:', res.user); 
        localStorage.setItem('role', res.user.role);
        setMessage('Usuario creado con éxito');
      }
    } catch (error) {
      console.error('Error de autenticación:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message);
      } else if (error.message.includes('username')) {
        setMessage('Nombre de usuario incorrecto');
      } else if (error.message.includes('email')) {
        setMessage('Correo electrónico incorrecto');
      } else if (error.message.includes('password')) {
        setMessage('Contraseña incorrecta');
      } else {
        setMessage('Error de autenticación');
      }
    }
  };

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'} textAlign={'center'}>
            {isLogin ? 'Iniciar sesión' : 'Regístrate'}
          </Heading>
          <Text fontSize={'lg'} color={'gray.600'}>
            {isLogin
              ? 'Inicia sesión para continuar'
              : 'Regístrate para disfrutar de nuestros servicios'}
          </Text>
          {message && (
            <Text fontSize="lg" color={message.includes('Error') ? 'red.500' : 'green.500'} textAlign="center">
              {message}
            </Text>
          )}
        </Stack>
        <Box
          as={motion.div}
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'lg'}
          p={8}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Stack spacing={4} as="form" onSubmit={handleSubmit}>
            {!isLogin && (
              <FormControl id="username" isRequired>
                <FormLabel>Nombre de usuario</FormLabel>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  as={motion.input}
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                />
                
              </FormControl>
            )}
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
            <FormControl id="password" isRequired>
              <FormLabel>Contraseña</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  as={motion.input}
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                />
                <InputRightElement h={'full'}>
                  <Button
                    variant={'ghost'}
                    onClick={() => setShowPassword(!showPassword)}
                    as={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <Stack spacing={10} pt={2}>
              <Button
                loadingText="Submitting"
                size="lg"
                bg={'blue.400'}
                color={'white'}
                _hover={{
                  bg: 'blue.500',
                }}
                type="submit"
                as={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {isLogin ? 'Iniciar sesión' : 'Regístrate'}
              </Button>
            </Stack>
            <Stack pt={6}>
              <Text align={'center'}>
                {isLogin ? '¿No tienes una cuenta? ' : '¿Ya tienes una cuenta? '}
                <Link color={'blue.400'} onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? 'Regístrate' : 'Inicia sesión'}
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default AuthComponent;
