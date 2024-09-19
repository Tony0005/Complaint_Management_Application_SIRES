import React, { useContext, useEffect } from 'react';
import {Box,Flex,Text,IconButton,Button,Stack,Collapse,useColorModeValue,useBreakpointValue,useDisclosure,Menu,MenuButton,MenuList,MenuItem,Link,} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { HamburgerIcon, CloseIcon, ChevronDownIcon } from '@chakra-ui/icons';
import AuthContext from '../Login/Permission';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure();
  const { user, logout} = useContext(AuthContext);

  useEffect(() => {
    console.log('User state changed:', user);
  }, [user]);

  const NAV_ITEMS = [
    { label: 'Inicio', href: '/' },
    { label: 'Crear Caso', href: '/ComplaintForm' },
    (user && (user.role === 'user' || user.role === 'responsable' || user.role === 'admin')) && { label: 'Lista de Casos', href: '/ComplaintsList' },
    (user && (user.role === 'user' || user.role === 'responsable' || user.role === 'admin')) && { label: 'Actualizar Perfil', href: '/UpdateProfile' },
    user && user.role === 'admin' && {
      label: 'Areas', submenu: [
        { label: 'Crear Area', href: '/AreaForm' },
        { label: 'Lista de Areas', href: '/AreaList' },
      ]
    },
  ].filter(Boolean);

  return (
    <Box>
      <Flex
        bg={useColorModeValue('cyan.200', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
      >
        <Flex flex={{ base: 1, md: 'auto' }} ml={{ base: -2 }} display={{ base: 'flex', md: 'none' }}>
          <IconButton
            onClick={onToggle}
            icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Text
            as={RouterLink}
            to="/"
            textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
            fontFamily={'heading'}
            color={useColorModeValue('gray.800', 'white')}
            className="text-3xl font-bold tracking-wider hover:text-white transition duration-300 italic"
          >
            SIRES
          </Text>
          <Flex className="italic"  display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav NAV_ITEMS={NAV_ITEMS} />
          </Flex>
        </Flex>
        <Stack flex={{ base: 1, md: 0 }} justify={'flex-end'} direction={'row'} spacing={6}>
          {user ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={logout} fontSize={'sm'} fontWeight={600} color={'white'} bg={'blue.500'} _hover={{ bg: 'blue.600' }}>
              Cerrar Sesión
            </Button>
          </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button as={RouterLink} to={'/login'} fontSize={'sm'} fontWeight={600} color={'white'} bg={'blue.500'} _hover={{ bg: 'blue.600' }}>
                Autenticar
              </Button>
            </motion.div>
          )}
        </Stack>
      </Flex>
      <Collapse in={isOpen} animateOpacity>
        <MobileNav NAV_ITEMS={NAV_ITEMS} />
      </Collapse>
    </Box>
  );
};

const DesktopNav = ({ NAV_ITEMS }) => {
  return (
    <Stack  direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        navItem.submenu ? (
          <Menu key={navItem.label}>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              variant="ghost"
              _hover={{ bg: 'cyan.300', color: 'white' }}
              _focus={{ boxShadow: 'none' }}
            >
              {navItem.label}
            </MenuButton>
            <MenuList>
              {navItem.submenu.map((submenuItem) => (
                <MenuItem
                  key={submenuItem.label}
                  as={RouterLink}
                  to={submenuItem.href}
                  _hover={{ bg: 'cyan.300', color: 'white' }}
                >
                  {submenuItem.label}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        ) : (
          <Link
            key={navItem.label}
            as={RouterLink}
            to={navItem.href}
            fontSize={'lg'}
            px={3}
            py={2}
            rounded={'md'}
            _hover={{ textDecoration: 'none', color: 'white' }}
            color={'black'}
            transition={'color 0.3s ease'}
          >
            {navItem.label}
          </Link>
        )
      ))}
    </Stack>
  );
};

const MobileNav = ({ NAV_ITEMS }) => {
  return (
    <Stack bg={useColorModeValue('white', 'gray.800')} p={4} display={{ md: 'none' }}>
      {NAV_ITEMS.map((navItem) => (
        navItem.submenu ? (
          <Stack key={navItem.label} spacing={4}>
            <Box>
              <Text fontWeight={600}>{navItem.label}</Text>
            </Box>
            {navItem.submenu.map((submenuItem) => (
              <Box key={submenuItem.label} pl={4}>
                <Link
                  className="italic" 
                  as={RouterLink}
                  to={submenuItem.href}
                  fontSize={'lg'}
                  px={3}
                  py={2}
                  rounded={'md'}
                  _hover={{ textDecoration: 'none', color: 'white' }}
                  color={'black'}
                  transition={'color 0.3s ease'}
                >
                  {submenuItem.label}
                </Link>
              </Box>
            ))}
          </Stack>
        ) : (
          <Link
            key={navItem.label}
            as={RouterLink}
            to={navItem.href}
            fontSize={'lg'}
            px={3}
            py={2}
            rounded={'md'}
            _hover={{ textDecoration: 'none', color: 'white' }}
            color={'black'}
            transition={'color 0.3s ease'}
          >
            {navItem.label}
          </Link>
        )
      ))}
    </Stack>
  );
};

export default Navbar;


