'use client';

import { useState, useEffect } from 'react';
import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import { ChatMain } from './ChatMain';
import { ChatSidebar } from './ChatSidebar';
import {Chat, Message} from '../types';


export function AiChatContainer() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const bgColor = useColorModeValue('white', 'gray.800');

  // Load chats from localStorage on component mount
  useEffect(() => {
    const savedChats = localStorage.getItem('ai-chats');
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      setChats(parsedChats);
      
      // Set current chat to the most recent one if it exists
      if (parsedChats.length > 0) {
        setCurrentChatId(parsedChats[0].id);
      }
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('ai-chats', JSON.stringify(chats));
    }
  }, [chats]);

  // Create a new chat
  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date()
    };
    
    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
  };

  // Add a message to the current chat
  const addMessage = (content: string, isUser: boolean) => {
    if (!currentChatId) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser,
      timestamp: new Date()
    };
    
    const updatedChats = chats.map(chat => {
      if (chat.id === currentChatId) {
        // Update chat title based on first user message if it's still the default
        let updatedTitle = chat.title;
        if (chat.title === 'New Chat' && isUser && chat.messages.length === 0) {
          updatedTitle = content.length > 30 ? `${content.substring(0, 30)}...` : content;
        }
        
        return {
          ...chat,
          title: updatedTitle,
          messages: [...chat.messages, newMessage]
        };
      }
      return chat;
    });
    
    setChats(updatedChats);
  };

  // Delete a chat
  const deleteChat = (chatId: string) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    
    // If we deleted the current chat, select another one
    if (chatId === currentChatId && updatedChats.length > 0) {
      setCurrentChatId(updatedChats[0].id);
    } else if (updatedChats.length === 0) {
      setCurrentChatId(null);
    }
  };

  // Get the current chat
  const currentChat = chats.find(chat => chat.id === currentChatId) || null;

  return (
    <Flex h="calc(100vh - 64px)" overflow="hidden">
      <ChatSidebar 
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={setCurrentChatId}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
      />
      <Box 
        flex="1" 
        bg={bgColor} 
        borderLeft="1px" 
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <ChatMain 
          chat={currentChat}
          onSendMessage={(content) => {
            // If no current chat, create one
            if (!currentChatId) {
              createNewChat();
            }
            
            // Add user message
            addMessage(content, true);
            
            // Simulate AI response (replace with actual API call)
            setTimeout(() => {
              addMessage(`This is a simulated response to: "${content}"`, false);
            }, 1000);
          }}
          onNewChat={createNewChat}
        />
      </Box>
    </Flex>
  );
}