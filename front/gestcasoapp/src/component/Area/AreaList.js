import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as AreaServer from "./AreaServer";
//import AuthContext from "../Login/Permission";
import { Box, Button, Table, Tbody, Td, Th, Thead, Tr, Heading } from '@chakra-ui/react';

const AreasList = () => {
  const [areas, setAreas] = useState([]);
  //const { user } = useContext(AuthContext);

  const listAreas = async () => {
    try {
      const areas = await AreaServer.listAreas();
      setAreas(areas);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  useEffect(() => {
    listAreas();
  }, []);

  const handleDelete = async (id) => {
    try {
      await AreaServer.deleteArea(id);
      setAreas(areas.filter((area) => area.id !== id));
    } catch (error) {
      console.error("Error deleting area:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Heading as="h1" className="text-center text-3xl font-bold mb-8">Listado de Áreas</Heading>
      <Box className="text-right mb-8">
        <Link to="/AreaForm">
          <Button colorScheme="teal">Añadir Nueva Área</Button>
        </Link>
      </Box>
      <Box className="bg-gray-100 p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Nombre</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {areas.map((area) => (
              <Tr key={area.id}>
                <Td>{area.name}</Td>
                <Td>
                  <Link to={`/AreaForm/${area.id}`}>
                    <Button colorScheme="blue" mr="4">Editar</Button>
                  </Link>
                  <Button colorScheme="red" onClick={() => handleDelete(area.id)}>Eliminar</Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </div>
  );
};

export default AreasList;
