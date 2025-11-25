'use client';

import { 
  Box, 
  VStack, 
  Button, 
  Text, 
  Icon, 
  Flex, 
  useColorModeValue,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import {Chat} from '../types';
import { formatDistanceToNow } from 'date-fns';

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

export function ChatSidebar({ 
  chats, 
  currentChatId, 
  onSelectChat, 
  onNewChat,
  onDeleteChat
}: ChatSidebarProps) {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.700');
  const activeBgColor = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box 
      w="300px" 
      h="100%" 
      bg={bgColor} 
      p={4} 
      overflowY="auto"
      borderRight="1px"
      borderColor={borderColor}
    >
      <Button 
        leftIcon={<AddIcon />} 
        colorScheme="blue" 
        variant="solid" 
        size="md" 
        width="100%" 
        mb={4}
        onClick={onNewChat}
      >
        New Chat
      </Button>

      <Text fontWeight="bold" mb={2} fontSize="sm" color="gray.500">
        RECENT CONVERSATIONS
      </Text>

      <VStack spacing={1} align="stretch">
        {chats.map(chat => (
          <Flex
            key={chat.id}
            p={3}
            borderRadius="md"
            cursor="pointer"
            bg={chat.id === currentChatId ? activeBgColor : 'transparent'}
            _hover={{ bg: chat.id === currentChatId ? activeBgColor : hoverBgColor }}
            onClick={() => onSelectChat(chat.id)}
            justify="space-between"
            align="center"
          >
            <Box overflow="hidden">
              <Text 
                fontWeight={chat.id === currentChatId ? "semibold" : "normal"}
                noOfLines={1}
              >
                {chat.title}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true })}
              </Text>
            </Box>
            
            <Tooltip label="Delete chat" placement="top">
              <IconButton
                aria-label="Delete chat"
                icon={<DeleteIcon />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
              />
            </Tooltip>
          </Flex>
        ))}
        
        {chats.length === 0 && (
          <Text color="gray.500" fontSize="sm" textAlign="center" mt={4}>
            No conversations yet
          </Text>
        )}
      </VStack>
    </Box>
  );
}