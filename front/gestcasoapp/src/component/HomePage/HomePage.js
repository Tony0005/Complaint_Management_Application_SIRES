import React, { useState } from 'react';
import * as ComplaintServer from '../Complaint/ComplaintServer';
import * as AnswerServer from '../Answer/AnswerServer';
import { Box, Button, Flex, Heading, Input, Text, VStack, HStack, List, ListItem, Link, Icon, Tooltip } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import backgroundImage from '../assets/background.jpg';
import { FaImage, FaFileAlt } from "react-icons/fa";

export default function HomePage() {
  const [code, setCode] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (event) => {
    setCode(event.target.value);
  };

  const handleSearch = async () => {
    try {
      const data = await ComplaintServer.getComplaintByIdentificationNumber(code);

      if (Array.isArray(data) && data.length > 0) {
        const foundComplaint = data.find(complaint => complaint.identification_number === code);
        if (foundComplaint) {
          setComplaint(foundComplaint);
          setError('');

          const response = await AnswerServer.getAnswersByComplaintId(foundComplaint.id);
          const filteredAnswers = response.filter(answer => answer.case === foundComplaint.id);
          setComplaint(prevComplaint => ({
            ...prevComplaint,
            answers: filteredAnswers
          }));
        } else {
          setError('No se encontró ninguna queja con ese número de identificación.');
          setComplaint(null);
        }
      } else {
        setError('No se encontró ninguna queja con ese número de identificación.');
        setComplaint(null);
      }
    } catch (error) {
      setError('No se encontró ninguna queja con ese número de identificación.');
      setComplaint(null);
    }
  };

  return (
    <VStack spacing={6} align="center" p={6} position="relative">
      <Box
        w="full"
        h="100vh"
        position="fixed"
        top="0"
        left="0"
        zIndex="-1"
        backgroundImage={`url(${backgroundImage})`}
        backgroundSize="cover"
        backgroundPosition="center"
        filter="blur(0px)"  
        opacity="0.6"
      />

      <Flex
        direction="column"
        align="center"
        bg="white"
        p={8}
        rounded="lg"
        shadow="lg"
        w={{ base: '90%', md: '60%' }}
        zIndex="1"
        backdropFilter="blur(2px)" 
        mt="5"  
        ml="96"  
      >
        <Heading className="italic" fontFamily="Courier New, monospace" as="h1" size="xl" mb={4} textAlign="center">
          Buscar Caso
        </Heading>
        <HStack mb={4} w="full">
          <Input
            value={code}
            onChange={handleInputChange}
            placeholder="Ingresa el código"
            size="lg"
            variant="outline"
            focusBorderColor="teal.500"
          />
          <Button 
            colorScheme="blue"
            size="lg"
            onClick={handleSearch}
            as={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Buscar
          </Button>
        </HStack>
        {complaint && (
          <Box bg="gray.50" p={6} rounded="md" shadow="md" w="full">
          <Heading as="h2" size="md" mb={2}>
            {complaint.identification_number}
          </Heading>
          <Text fontWeight="bold">Título:</Text>
          <Box 
            mt={2} 
            p={4} 
            borderWidth="1px" 
            borderRadius="lg" 
            boxShadow="sm" 
            bg="white" 
            _hover={{ bg: "gray.100", boxShadow: "md" }}
          >
            <Text mb={4}>{complaint.title}</Text>
          </Box>
        
          <Text className="italic" fontFamily="Courier New, monospace" fontWeight="bold" mt={4}>Descripción:</Text>
          <Box 
            mt={2} 
            p={4} 
            borderWidth="1px" 
            borderRadius="lg" 
            boxShadow="sm" 
            bg="white" 
            _hover={{ bg: "gray.100", boxShadow: "md" }}
          >
            <Text mb={4}>{complaint.description}</Text>
          </Box>
        
          <Text className="italic" fontFamily="Courier New, monospace" fontWeight="bold" mt={4}>Estado del Caso:</Text>
          <Box 
            mt={2} 
            p={4} 
            borderWidth="1px" 
            borderRadius="lg" 
            boxShadow="sm" 
            bg="white" 
            _hover={{ bg: "gray.100", boxShadow: "md" }}
          >
            <Text mb={4}>{complaint.status}</Text>
          </Box>
        
          {complaint.answers && complaint.answers.length > 0 && (
            <Box mt={4}>
              <Text className="italic" fontFamily="Courier New, monospace" fontWeight="bold">Respuestas:</Text>
              <List spacing={3} mt={2}>
                {complaint.answers.map((answer) => (
                  <ListItem 
                    key={answer.id} 
                    p={4} 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    boxShadow="sm" 
                    bg="white" 
                    _hover={{ bg: "gray.100", boxShadow: "md" }}
                  >
                    <Text>{answer.description}</Text>
        
                    {answer.attachments && answer.attachments.length > 0 && (
                      <Box mt={4}>
                        <Text className="italic" fontFamily="Courier New, monospace" fontWeight="bold">Archivos adjuntos:</Text>
                        <Box mt={2} display="flex" gap={2}>
                          {answer.attachments.map((attachment) => (
                            <Tooltip key={attachment.id} label="Ver archivo adjunto" aria-label="Archivo adjunto">
                              <Link href={attachment.file_add} isExternal>
                                <Icon
                                  as={attachment.file_add.endsWith('.jpg') || attachment.file_add.endsWith('.png') ? FaImage : FaFileAlt}
                                  boxSize={6}
                                  color="blue.500"
                                  _hover={{ color: "blue.700" }}
                                />
                              </Link>
                            </Tooltip>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
        )}
        {error && (
          <Text mt={4} color="red.500">
            {error}
          </Text>
        )}
      </Flex>
    </VStack>
  );
}

