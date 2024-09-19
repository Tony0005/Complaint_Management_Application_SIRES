import React, { useState, useEffect } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, VStack, Checkbox } from '@chakra-ui/react';
import * as UserServer from '../Login/UserServer';
import * as ComplaintServer from "./ComplaintServer"
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';

const AssignMultipleUsersModal = ({ isOpen, onClose, complaintId }) => {
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await UserServer.listUsers();
                const responsables = data.filter(user => user.role === 'responsable');
                console.log('Users Data:', responsables); // Verifica la estructura de los datos obtenidos
                setUsers(responsables);
            } catch (error) {
                console.error('Error fetching users:', error);
                toast.error('Error al obtener usuarios');
            }
        };

        fetchUsers();
    }, []);

    const handleUserChange = (userId) => {
        setSelectedUsers((prevSelectedUsers) => {
            const newSelectedUsers = prevSelectedUsers.includes(userId)
                ? prevSelectedUsers.filter((id) => id !== userId)
                : [...prevSelectedUsers, userId];

            console.log('Updated Selected Users:', newSelectedUsers); // Verifica el estado actualizado
            return newSelectedUsers;
        });
    };

    const handleAssignUsers = async () => {
      if (selectedUsers.length > 0) {
          setAssigning(true);
          console.log('Selected Users:', selectedUsers); // Verifica el contenido
          console.log('Complaint ID:', complaintId); // Verifica el ID de la queja
          try {
              await ComplaintServer.assignMultipleUsers(complaintId, selectedUsers);
              onClose();
              toast.success(`Caso asignado con éxito a los usuarios`); 
          } catch (error) {
              console.error('Error al asignar usuarios:', error);
              toast.error(`Error al asignar usuarios: ${error.message || 'Error desconocido'}`);
          } finally {
              setAssigning(false); // Ocultar mensaje de carga
          }
      } else {
          toast.warning('No se ha seleccionado ningún usuario.');
      }
  };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Asignar múltiples usuarios a queja</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {assigning ? (
                        <p>Asignando...</p>
                    ) : (
                        <VStack spacing={4}>
                            {users.map((user) => (
                                <Checkbox
                                    key={user.id}
                                    isChecked={selectedUsers.includes(user.id)}
                                    onChange={() => handleUserChange(user.id)}
                                >
                                    {user.username}
                                </Checkbox>
                            ))}
                        </VStack>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button
                        colorScheme="blue"
                        onClick={handleAssignUsers}
                        disabled={assigning}
                    >
                        Asignar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AssignMultipleUsersModal;
