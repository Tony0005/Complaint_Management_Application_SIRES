import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, Heading,Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaSave, FaEdit } from 'react-icons/fa';
import Select from 'react-select';
import * as AreaServer from './AreaServer';
import * as UserServer from "../Login/UserServer";

const AreaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [area, setArea] = useState({ name: '', manager: '', members: [] });
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({ name: '' });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await UserServer.listUsers();
        setUsers(userList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();

    if (id) {
      setIsEditing(true);
      const fetchArea = async () => {
        try {
          const data = await AreaServer.getArea(id);
          setArea({
            name: data.name,
            manager: data.manager || '',
            members: data.members || []
          });
        } catch (error) {
          console.error('Error fetching area:', error);
        }
      };
      fetchArea();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setArea(prevState => ({
      ...prevState,
      [name]: value
    }));
    if (name === 'name') {
      setErrors(prevState => ({ ...prevState, name: '' }));
    }
  };

  const handleMembersChange = (selectedOptions) => {
    const selectedMembers = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setArea(prevState => ({
      ...prevState,
      members: selectedMembers
    }));
  };

  const validateName = (name) => {
    const regex = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s\W]+$/;
    if (!regex.test(name)) {
      return 'El nombre debe contener al menos una letra y no puede estar compuesto solo de números o signos.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameError = validateName(area.name);
    if (nameError) {
      setErrors(prevState => ({ ...prevState, name: nameError }));
      return;
    }

    try {
      const formattedArea = {
        ...area,
        manager: parseInt(area.manager, 10),
        members: area.members.map(member => parseInt(member, 10))
      };
      
      if (formattedArea.manager) {
        await UserServer.updateUserRole(formattedArea.manager, 'responsable');
      }

      if (isEditing) {
        await AreaServer.updateArea(id, formattedArea);
      } else {
        await AreaServer.registerArea(formattedArea);
      }

      navigate('/AreaList');
    } catch (error) {
      console.error('Error saving area:', error);
    }
  };

  const userOptions = users.map(user => ({
    value: user.id,
    label: user.username
  }));

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
        {isEditing ? 'Editar Área' : 'Añadir Nueva Área'}
      </Heading>
      <form onSubmit={handleSubmit}>
        <FormControl mb="4">
          <FormLabel htmlFor="name">Nombre</FormLabel>
          <Input
            id="name"
            name="name"
            value={area.name}
            onChange={handleChange}
            placeholder="Nombre del área"
            required
            as={motion.input}
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
           {errors.name && <Text color="red.500" mt="2">{errors.name}</Text>}
        </FormControl>

        <FormControl mb="4">
          <FormLabel htmlFor="manager">Jefe de Área</FormLabel>
          <Select
            id="manager"
            name="manager"
            value={userOptions.find(option => option.value === area.manager)}
            onChange={(option) => handleChange({ target: { name: 'manager', value: option.value } })}
            options={userOptions}
            placeholder="Selecciona un manager"
            styles={{
              control: (provided) => ({
                ...provided,
                borderColor: '#3182CE',
                '&:hover': { borderColor: '#2B6CB0' },
                boxShadow: 'none',
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected ? '#2B6CB0' : provided.backgroundColor,
                '&:hover': { backgroundColor: '#3182CE', color: 'white' },
              }),
            }}
          />
        </FormControl>

        <FormControl mb="4">
          <FormLabel htmlFor="members">Miembros</FormLabel>
          <Select
            id="members"
            name="members"
            isMulti
            value={userOptions.filter(option => area.members.includes(option.value))}
            onChange={handleMembersChange}
            options={userOptions}
            placeholder="Selecciona miembros"
            styles={{
              control: (provided) => ({
                ...provided,
                borderColor: '#3182CE',
                '&:hover': { borderColor: '#2B6CB0' },
                boxShadow: 'none',
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected ? '#2B6CB0' : provided.backgroundColor,
                '&:hover': { backgroundColor: '#3182CE', color: 'white' },
              }),
              multiValue: (provided) => ({
                ...provided,
                backgroundColor: '#3182CE',
                color: 'white',
              }),
              multiValueLabel: (provided) => ({
                ...provided,
                color: 'white',
              }),
            }}
          />
        </FormControl>

        <Button
          colorScheme="teal"
          type="submit"
          leftIcon={isEditing ? <FaEdit /> : <FaSave />}
          as={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          {isEditing ? 'Actualizar Área' : 'Crear Área'}
        </Button>
      </form>
    </Box>
  );
};

export default AreaForm;



