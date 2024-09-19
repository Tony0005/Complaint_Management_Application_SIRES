import React, { useState, useEffect } from 'react';
import {Modal,ModalOverlay,ModalContent,ModalHeader,ModalFooter,ModalBody,ModalCloseButton,Button} from '@chakra-ui/react';
import * as UserServer from '../Login/UserServer';

const UserAssignModal = ({ isOpen, onClose, complaintId, onAssignUser }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [assigning] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await UserServer.listUsers();
        const responsables = data.filter(user => user.role === 'responsable');
        setUsers(responsables);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleAssignUser = () => {
    if (selectedUser) {
      onAssignUser(selectedUser); // Cambiado a onAssignUser
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Asignar usuario a queja</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {assigning ? (
            <p>Asignando...</p>
          ) : (
            <select onChange={(e) => setSelectedUser(e.target.value)}>
              <option value="">Selecciona un usuario</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            onClick={handleAssignUser}
            disabled={assigning}
          >
            Asignar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UserAssignModal;
