'use client';

import { 
  Box, 
  VStack, 
  Input, 
  Button, 
  Flex, 
  Text, 
  useColorModeValue,
  IconButton,
  Textarea,
  Divider,
  Center,
  Heading,
  Icon
} from '@chakra-ui/react';
import { ArrowUpIcon, AddIcon } from '@chakra-ui/icons';
import { FaRobot, FaUser } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';
import { Chat } from '../types';
import ReactMarkdown from 'react-markdown';

interface ChatMainProps {
  chat: Chat | null;
  onSendMessage: (content: string) => void;
  onNewChat: () => void;
}

export function ChatMain({ chat, onSendMessage, onNewChat }: ChatMainProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const userBgColor = useColorModeValue('blue.50', 'blue.900');
  const aiBgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // Handle textarea height adjustment
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Flex direction="column" h="100%">
      {/* Messages area */}
      <Box flex="1" overflowY="auto" p={4}>
        {chat ? (
          chat.messages.length > 0 ? (
            <VStack spacing={4} align="stretch">
              {chat.messages.map((msg) => (
                <Flex 
                  key={msg.id} 
                  bg={msg.isUser ? userBgColor : aiBgColor}
                  p={4}
                  borderRadius="lg"
                  maxW="90%"
                  alignSelf={msg.isUser ? "flex-end" : "flex-start"}
                >
                  <Box mr={3} mt={1}>
                    <Icon 
                      as={msg.isUser ? FaUser : FaRobot} 
                      boxSize={5} 
                      color={msg.isUser ? "blue.500" : "gray.500"} 
                    />
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" mb={1}>
                      {msg.isUser ? "You" : "AI Assistant"}
                    </Text>
                    <Box className="markdown-content">
                      {msg.isUser ? (
                        <Text>{msg.content}</Text>
                      ) : (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      )}
                    </Box>
                  </Box>
                </Flex>
              ))}
              <div ref={messagesEndRef} />
            </VStack>
          ) : (
            <Center h="100%">
              <VStack spacing={4}>
                <Heading size="md">Start a new conversation</Heading>
                <Text color="gray.500">Type a message below to begin</Text>
              </VStack>
            </Center>
          )
        ) : (
          <Center h="100%">
            <VStack spacing={4}>
              <Heading size="md">Welcome to AI Chat</Heading>
              <Text color="gray.500">Start a new conversation to begin</Text>
              <Button 
                leftIcon={<AddIcon />} 
                colorScheme="blue" 
                onClick={onNewChat}
              >
                New Chat
              </Button>
            </VStack>
          </Center>
        )}
      </Box>

      {/* Input area */}
      {chat && (
        <>
          <Divider borderColor={borderColor} />
          <Box p={4}>
            <form onSubmit={handleSubmit}>
              <Flex>
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  resize="none"
                  minH="50px"
                  maxH="200px"
                  mr={2}
                  borderRadius="md"
                  rows={1}
                />
                <IconButton
                  colorScheme="blue"
                  aria-label="Send message"
                  icon={<ArrowUpIcon />}
                  type="submit"
                  isDisabled={!message.trim()}
                  alignSelf="flex-end"
                  height="50px"
                />
              </Flex>
            </form>
            <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
              Press Enter to send, Shift+Enter for new line
            </Text>
          </Box>
        </>
      )}
    </Flex>
  );
}