import React, { useState, useEffect } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button } from '@chakra-ui/react';
import * as AreaServer from '../Area/AreaServer';

const UserDelegateModal = ({ isOpen, onClose, complaintId, onDelegateUser }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await AreaServer.getAllAreaMembers();
        setUsers(data); // Ahora data contiene la lista completa de usuarios
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const handleDelegateUser = async () => {
    if (selectedUser) {
      setAssigning(true);
      try {
        await onDelegateUser(selectedUser);
        onClose();
      } catch (error) {
        console.error('Error assigning user:', error);
      } finally {
        setAssigning(false);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delegar queja</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <p>Cargando usuarios...</p>
          ) : (
            <select onChange={(e) => setSelectedUser(e.target.value)} value={selectedUser || ''}>
              <option value="" disabled>Selecciona un usuario</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          )}
          {assigning && <p>Delegando...</p>}
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            onClick={handleDelegateUser}
            disabled={assigning || !selectedUser}
          >
            Delegar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UserDelegateModal;
