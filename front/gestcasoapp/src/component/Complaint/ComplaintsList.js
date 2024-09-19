
import React, { useState, useEffect, useContext } from 'react';
import * as ComplaintServer from './ComplaintServer';
import * as AnswerServer from '../Answer/AnswerServer';
import * as ProccedingComplaintServer from "../ProccedingComplaint/ProccedingComplaintServer";
import { Link } from 'react-router-dom';
import AuthContext from '../Login/Permission';
import UserAssignModal from './AssignComplaint';
import UserDelegateModal from './DelegateComplaint';
import { useDisclosure } from '@chakra-ui/react';
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import AssignMultipleUsersModal from './AssignComissionComplaint';
import { Select } from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import {  Box, Heading,  IconButton, Text, Flex,  Collapse, Input, Icon, Tooltip } from '@chakra-ui/react';
import { FaEdit, FaTrash, FaUserPlus, FaTasks, FaUsers, FaCalendarAlt, FaFileAlt, FaImage } from 'react-icons/fa';




const ComplaintList = () => {
  const [expandedComplaint, setExpandedComplaint] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]); 
  const [assigning, setAssigning] = useState(false); 
  const { user } = useContext(AuthContext);
  const [deadline, setDeadline] = useState(new Date());

  const {
    isOpen: isUserAssignOpen,
    onOpen: onUserAssignOpen,
    onClose: onUserAssignClose
  } = useDisclosure();

  const {
    isOpen: isUserDelegateOpen,
    onOpen: onUserDelegateOpen,
    onClose: onUserDelegateClose
  } = useDisclosure();

  const {
    isOpen: isMultipleUsersOpen,
    onOpen: onMultipleUsersOpen,
    onClose: onMultipleUsersClose
  } = useDisclosure();

  const fetchMyComplaints = async () => {
    try {
      const data = await ComplaintServer.ListComplaint();
      setComplaints(data);
      console.log('Lista de quejas cargada:', data);
    } catch (error) {
      console.error('Error al cargar la lista de quejas:', error);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const handleComplaintClick = async (complaintId) => {
    if (expandedComplaint === complaintId) {
      setExpandedComplaint(null);
    } else {
      try {
        const [answers, proceedings] = await Promise.all([
          AnswerServer.getAnswersByComplaintId(complaintId),
          ProccedingComplaintServer.getProccedingComplaintByComplaintId(complaintId)
        ]);
        console.log('Respuestas cargadas:', answers);
        console.log('Tramites cargados:', proceedings);

        setComplaints(prevComplaints => {
          return prevComplaints.map(complaint => {
            if (complaint.id === complaintId) {
              return { ...complaint, answers, proceedings };
            }
            return complaint;
          });
        });

        setExpandedComplaint(complaintId);

      } catch (error) {
        console.error('Error al cargar respuestas o tramites:', error);
      }
    }
  };

  const handleDeleteComplaint = async (complaintId) => {
    try {
      await ComplaintServer.deleteComplaint(complaintId);
      fetchMyComplaints();
      console.log(`Queja con ID ${complaintId} eliminada correctamente.`);
    } catch (error) {
      console.error(`Error al eliminar queja con ID ${complaintId}:`, error);
    }
  };

  const handleAssignCase = (complaintId) => {
    setSelectedComplaintId(complaintId);
    onUserAssignOpen();
  };

  const handleDelegateCase = (complaintId) => {
    setSelectedComplaintId(complaintId);
    onUserDelegateOpen();
  };

  const handleCreateCommission = (complaintId) => {
    setSelectedComplaintId(complaintId);
    onMultipleUsersOpen();
  };

  const handleAssignUser = async (userId) => {
    try {
        const assignData = { assign_complaint: userId };
        const response = await ComplaintServer.assignComplaint(selectedComplaintId, assignData);
        
        if (response.success) {
            fetchMyComplaints();
            onUserAssignClose();
            toast.success(`Caso asignado con éxito al usuario`);
        } else {
            toast.error(`Error al asignar el caso: ${response.error || 'Error desconocido'}`);
        }
    } catch (error) {
        const errorMessage = 
            error.response?.data?.error ||
            error.message ||
            'Error desconocido';
        toast.error(`Error al asignar el caso: ${errorMessage}`);
    }
  };

  const handleDelegateUser = async (userId) => {
    setAssigning(true);
    try {
        const assignData = { assign_complaint: userId };
        const response = await ComplaintServer.assignComplaint(selectedComplaintId, assignData);
        
        if (response.success) {
            fetchMyComplaints();
            onUserDelegateClose();
            toast.success(`Caso delegado con éxito al usuario`);
        } else {
            toast.error(`Error al delegar el caso: ${response.error || 'Error desconocido'}`);
        }
    } catch (error) {
        const errorMessage = 
            error.response?.data?.error ||
            error.message ||
            'Error desconocido';
        toast.error(`Error al delegar el caso: ${errorMessage}`);
    } finally {
        setAssigning(false);
    }
};

  const handleAssignUsers = async () => {
    if (selectedUsers.length > 0) {
      setAssigning(true);
      try {
        const response = await ComplaintServer.assignMultipleUsers(selectedComplaintId, selectedUsers);
        if (response.success) {
          fetchMyComplaints(); 
          onMultipleUsersClose();
          toast.success('Usuarios asignados con éxito');
        } else {
          toast.error(`Error al asignar usuarios: ${response.error || 'Error desconocido'}`);
        }
      } catch (error) {
        console.error('Error al asignar usuarios:', error);
        const errorMessage = 
          error.response?.data?.error ||
          error.message ||
          'Error desconocido';
        toast.error(`Error al asignar usuarios: ${errorMessage}`);
      } finally {
        setAssigning(false);
      }
    } else {
      toast.warning('No se ha seleccionado ningún usuario.');
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      const response = await ComplaintServer.updateComplaintStatus(complaintId, newStatus);
      if (response) {
        fetchMyComplaints();
        toast.success('Estado actualizado con éxito');
      } else {
        toast.error('Error desconocido al actualizar el estado');
      }
    } catch (error) {
      const errorMessage = 
        error.response?.data?.error || 
        error.message || 
        'Error desconocido';
      toast.error(`Error al actualizar el estado: ${errorMessage}`);
    }
  };

  const handleAssignDeadline = async (complaintId) => {
    try {
      const deadlineData = { deadline: deadline.toISOString() };
      const response = await ComplaintServer.assignDeadline(complaintId, deadlineData);
      
      if (response.success) {
        fetchMyComplaints();
        toast.success('Tiempo límite asignado con éxito');
      } else {
        toast.error(`Error al asignar tiempo límite: ${response.error || 'Error desconocido'}`);
      }
    } catch (error) {
      const errorMessage = 
        error.response?.data?.error || 
        error.message || 
        'Error desconocido';
      toast.error(`Error al asignar tiempo límite: ${errorMessage}`);
    }
  };
  
  const renderStatusDropdown = (complaintId, currentStatus) => (
    <Select
      placeholder="Seleccionar estado"
      value={currentStatus}
      onChange={(e) => handleStatusChange(complaintId, e.target.value)}
      className="mt-2"
      variant="outline"
      size="sm"
    >
      <option value="en tramite">En Trámite</option>
      <option value="resuelto">Resuelto</option>
      <option value="rechazado">Rechazado</option>
    </Select>
  );

  function CustomDatePicker({ selected, onChange }) {
    return (
      <Input
        as={DatePicker}
        selected={selected}
        onChange={onChange}
        showTimeSelect
        dateFormat="Pp"
        size="md"
        borderColor="blue.500"
        focusBorderColor="blue.300"
        rounded="md"
        padding="1rem"
      />
    );
  }

  const renderActionButtons = (complaintId) => {
    const isAdmin = user && user.role === 'admin';
    const isResponsable = user && user.role === 'responsable';

    return (
      <Flex direction="row" justify="space-between" align="center" wrap="wrap" mt={4}>
        {(!isAdmin && !isResponsable ) && (
          <>
            <Link to={`/ComplaintForm/${complaintId}`}>
            <div className="flex flex-col items-center">
                <IconButton
                  icon={<FaEdit />}
                  colorScheme="blue"
                  aria-label="Editar"
                  size="sm"
                />
                <span className="mt-1 text-sm text-gray-700 italic">Editar</span>
            </div>
            </Link>
            <Link to={`/answer/${complaintId}`}>
            <div className="flex flex-col items-center">
                <IconButton
                  icon={<FaTasks />}
                  colorScheme="blue"
                  aria-label="Responder"
                  size="sm"
                />
                <span className="mt-1 text-sm text-gray-700 italic">Responder</span>
            </div>
            </Link>
          </>
        )}
        {isAdmin && (
          <>
            <div className="flex flex-col items-center">
            <IconButton
              icon={<FaTrash />}
              onClick={() => handleDeleteComplaint(complaintId)}
              colorScheme="red"
              aria-label="Eliminar"
              size="sm"
            />
                <span className="mt-1 text-sm text-gray-700 italic">Eliminar</span>
            </div>
            <Link to={`/answer/${complaintId}`}>
            <div className="flex flex-col items-center">
                <IconButton
                  icon={<FaTasks />}
                  colorScheme="blue"
                  aria-label="Responder"
                  size="sm"
                />
                <span className="mt-1 text-sm text-gray-700 italic">Responder</span>
            </div>
              </Link>
              <div className="flex flex-col items-center">
              <IconButton
              icon={<FaUserPlus />}
              onClick={() => handleAssignCase(complaintId)}
              colorScheme="blue"
              aria-label="Asignar Caso"
              size="sm"
            />
                <span className="mt-1 text-sm text-gray-700 italic">Asignar Caso</span>
            </div>
            <Link to={`/proccedingcomplaint/${complaintId}`}>
            <div className="flex flex-col items-center">
                <IconButton
                  icon={<FaTasks />}
                  colorScheme="gray"
                  aria-label="Crear Tramite "
                  size="sm"
                />
                <span className="mt-1 text-sm text-gray-700 italic">Crear Tramite de Caso</span>
            </div>
            </Link>      
            <div className="flex flex-col items-center">
            <IconButton
              icon={<FaUsers />}
              onClick={() => handleCreateCommission(complaintId)}
              colorScheme="blue"
              aria-label="Crear Comisión"
              size="sm"
            />
                <span className="mt-1 text-sm text-gray-700 italic">Crear Comisión</span>
            </div>
            <div>
                <label htmlFor="deadline" className="italic" fontFamily="Courier New, monospace" style={{ marginRight: "10px" }}>
                  Selecciona la fecha límite:
                </label>
                <CustomDatePicker
                  selected={deadline}
                  onChange={(date) => setDeadline(date)}
                />
              </div>
              <div className="flex flex-col items-center">
              <IconButton
                icon={<FaCalendarAlt />}
                onClick={() => handleAssignDeadline(complaintId)}
                colorScheme="blue"
                aria-label="Asignar Tiempo Límite"
                size="sm"
              />
                <span className="mt-1 text-sm text-gray-700 italic">Asignar Tiempo Límite</span>
            </div>
          </>
        )}
        {isResponsable && (
          <>
          <div className="flex flex-col items-center">
          <IconButton
              icon={<FaUserPlus />}
              onClick={() => handleDelegateCase(complaintId)}
              colorScheme="blue"
              aria-label="Delegar Caso"
              size="sm"
            />
                <span className="mt-1 text-sm text-gray-700 italic">Delegar Caso</span>
            </div> 
          <Link to={`/proccedingcomplaint/${complaintId}`}>
          <div className="flex flex-col items-center">
                <IconButton
                  icon={<FaTasks />}
                  colorScheme="gray"
                  aria-label="Crear Tramite "
                  size="sm"
                />
                <span className="mt-1 text-sm text-gray-700 italic">Crear Tramite de Caso</span>
            </div>
        </Link> 
        </>
        )}
      </Flex>
    );
  };

  return (
    <Box maxW="3xl" mx="auto" px={4} py={8}>
      <Heading className="italic" fontFamily="Courier New, monospace" as="h1" size="lg" textAlign="center" mb={4}>
        Lista de Casos
      </Heading>
      {complaints.map((complaint) => (
        <div key={complaint.id} className="p-4 bg-white shadow-md rounded-lg mb-4 cursor-pointer transition-transform duration-300 transform hover:scale-105">
          <div className="flex justify-between cursor-pointer" onClick={() => handleComplaintClick(complaint.id)}>
          <Text className="italic" fontFamily="Courier New, monospace" fontWeight="bold" fontSize="lg">{complaint.title}</Text>
            <p className="italic">{complaint.status}</p>
          </div>
          {expandedComplaint === complaint.id && (
            <Collapse in={expandedComplaint === complaint.id} animateOpacity>
            <Box mt={4} borderWidth="1px" borderRadius="lg" p={4}>
              {(user.role === 'admin' || user.role === 'responsable') && 
                renderStatusDropdown(complaint.id, complaint.status)
              }
        
        <Box mt={4}>
  <Heading className="italic" fontFamily="Courier New, monospace" as="h4" size="sm">
    Descripción:
  </Heading>
  <Box 
    mt={2} 
    p={4} 
    borderWidth="1px" 
    borderRadius="lg" 
    boxShadow="sm" 
    bg="gray.50" 
    _hover={{ bg: "gray.100", boxShadow: "md" }}
  >
    <Text>{complaint.description}</Text>
  </Box>

  {complaint.attachments && complaint.attachments.length > 0 && (
    <Box mt={4}>
      <Heading className="italic" fontFamily="Courier New, monospace" as="h4" size="sm">
        Archivos adjuntos:
      </Heading>
      <Box mt={2} display="flex" gap={2}>
        {complaint.attachments.map((attachment) => (
          <Tooltip key={attachment.id} label="Ver archivo adjunto" aria-label="Archivo adjunto">
            <a href={attachment.file_add} target="_blank" rel="noopener noreferrer">
              <Icon
                as={attachment.file_add.endsWith('.jpg') || attachment.file_add.endsWith('.png') ? FaImage : FaFileAlt}
                boxSize={6}
                color="blue.500"
                _hover={{ color: "blue.700" }}
              />
            </a>
          </Tooltip>
        ))}
      </Box>
    </Box>
  )}
</Box>
        
              {(user.role === 'admin' || user.role === 'responsable') &&
                complaint.proceedings && complaint.proceedings.length > 0 && (
                  <Box mt={4}>
                <Heading className="italic" fontFamily="Courier New, monospace" as="h4" size="sm">Trámites:</Heading>
                <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                      {complaint.proceedings.filter(proceeding => proceeding.case === complaint.id).map((proceeding) => (
                          <li key={proceeding.id}>
                            <Box 
                              mt={2} 
                              p={4} 
                              borderWidth="1px" 
                              borderRadius="lg" 
                              boxShadow="sm" 
                              bg="gray.50" 
                            _hover={{ bg: "gray.100", boxShadow: "md" }}
                       >
                        <Text>{proceeding.description}</Text>
                             </Box>

                          {proceeding.attachments && proceeding.attachments.length > 0 && (
                      <Box mt={4}>
                      <Heading className="italic" fontFamily="Courier New, monospace" as="h4" size="sm">
                          Archivos adjuntos:
                      </Heading>
                      <Box mt={2} display="flex" gap={2}>
                        {proceeding.attachments.map((attachment) => (
                        <Tooltip key={attachment.id} label="Ver archivo adjunto" aria-label="Archivo adjunto">
                           <a href={attachment.file_add} target="_blank" rel="noopener noreferrer">
                    <Icon
                      as={attachment.file_add.endsWith('.jpg') || attachment.file_add.endsWith('.png') ? FaImage : FaFileAlt}
                      boxSize={6}
                      color="blue.500"
                      _hover={{ color: "blue.700" }}
                    />
                        </a>
                       </Tooltip>
                         ))}
                         </Box>
                      </Box>
                     )}
                    </li>
                    ))}
                  </ul>
                </Box>
              )}
        
              {complaint.answers && complaint.answers.length > 0 && (
                <Box mt={4}>
                <Heading className="italic" fontFamily="Courier New, monospace" as="h4" size="sm">Respuestas:</Heading>
                <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                  {complaint.answers
                    .filter(answer => answer.case === complaint.id)
                    .map((answer) => (
                      <li key={answer.id}>
                        <Box 
                          mt={2} 
                          p={4} 
                          borderWidth="1px" 
                          borderRadius="lg" 
                          boxShadow="sm" 
                          bg="gray.50" 
                          _hover={{ bg: "gray.100", boxShadow: "md" }}
                        >
                          <Text>{answer.description}</Text>
                        </Box>
              
                        {answer.attachments && answer.attachments.length > 0 && (
                          <Box mt={2}>
                            <Heading className="italic" fontFamily="Courier New, monospace" as="h4" size="sm">
                              Archivos adjuntos:
                            </Heading>
                            <Box mt={2} display="flex" gap={2}>
                            {answer.attachments.map((attachment) => (
                              <Tooltip key={attachment.id} label="Ver archivo adjunto" aria-label="Archivo adjunto">
                                <a href={attachment.file_add} target="_blank" rel="noopener noreferrer">
                                  <Icon
                                    as={attachment.file_add.endsWith('.jpg') || attachment.file_add.endsWith('.png') ? FaImage : FaFileAlt}
                                    boxSize={6}
                                    color="blue.500"
                                    _hover={{ color: "blue.700" }}
                                  />
                                </a>
                              </Tooltip>
                            ))}
                            </Box>
                          </Box>
                        )}
                      </li>
                    ))}
                </ul>
              </Box>
              )}
        
              {(user.role === 'responsable' || user.role === "admin") && (
                <Text className="italic" fontFamily="Courier New, monospace" mt={4}>
                  <strong>Fecha límite de respuesta:</strong> 
                  {complaint.deadline ? format(new Date(complaint.deadline), 'PPpp') : 'No asignada'}
                </Text>
              )}
        
              <Box mt={4}>
                {renderActionButtons(complaint.id)}
              </Box>
            </Box>
          </Collapse>
          )}
        </div>
      ))}
      <UserAssignModal
        isOpen={isUserAssignOpen}
        onClose={onUserAssignClose}
        onAssignUser={handleAssignUser}
        complaintId={selectedComplaintId}
      />
      <UserDelegateModal
        isOpen={isUserDelegateOpen}
        onClose={onUserDelegateClose}
        onDelegateUser={handleDelegateUser}
        complaintId={selectedComplaintId}
      />
      <AssignMultipleUsersModal
        isOpen={isMultipleUsersOpen}
        onClose={onMultipleUsersClose}
        onAssignUsers={handleAssignUsers}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers} 
        assigning={assigning} 
        complaintId={selectedComplaintId}
      />
    </Box>
  );
};

export default ComplaintList;
