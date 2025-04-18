import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Typography, Paper, CircularProgress, IconButton, Chip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { clinicalAgent } from '../../services/ai/agent/ClinicalAgent';
import { MedicalSpecialty } from '../../services/ai/types';

// Definir tipos de mensajes para el chat
interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface AIAssistantChatProps {
  patientId?: string;
  activeSection?: string;
  specialty?: MedicalSpecialty;
  onMessageProcessed?: (message: string, response: string) => void;
}

/**
 * Componente de chat para interactuar con el agente clínico de IA
 */
export const AIAssistantChat: React.FC<AIAssistantChatProps> = ({
  patientId,
  activeSection,
  specialty = 'physiotherapy',
  onMessageProcessed,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Configurar el agente al montar el componente
  useEffect(() => {
    if (specialty) {
      clinicalAgent.setSpecialty(specialty);
    }

    if (patientId) {
      clinicalAgent.setContext({
        specialty,
        currentSection: activeSection,
        patientContext: {
          patientId,
        }
      });
    }
  }, [patientId, specialty, activeSection]);

  // Desplazamiento automático al nuevo mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await clinicalAgent.sendMessage(inputValue);

      const assistantMessage: ChatMessage = {
        id: response.messageId,
        content: response.content,
        sender: 'assistant',
        timestamp: response.timestamp
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (onMessageProcessed) {
        onMessageProcessed(inputValue, response.content);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar mensaje');
      console.error('Error en el asistente:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConversation = () => {
    setMessages([]);
    clinicalAgent.clearConversation();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Asistente Clínico</Typography>
        <Box>
          <Chip 
            label={specialty} 
            color="primary" 
            size="small" 
            sx={{ mr: 1 }} 
          />
          <IconButton 
            size="small" 
            onClick={handleClearConversation} 
            title="Limpiar conversación"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography variant="body2">
              Envía un mensaje para comenzar la conversación con el asistente clínico.
            </Typography>
          </Box>
        )}

        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: message.sender === 'user' ? 'primary.light' : 'grey.100',
              color: message.sender === 'user' ? 'white' : 'text.primary',
              borderRadius: 2,
              px: 2,
              py: 1,
              maxWidth: '80%'
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>
        ))}

        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, alignSelf: 'flex-start' }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Procesando...</Typography>
          </Box>
        )}

        {error && (
          <Box
            sx={{
              alignSelf: 'center',
              backgroundColor: 'error.light',
              color: 'error.contrastText',
              borderRadius: 2,
              px: 2,
              py: 1,
            }}
          >
            <Typography variant="body2">{error}</Typography>
            <Button
              size="small"
              startIcon={<AutorenewIcon />}
              onClick={handleSendMessage}
              sx={{ mt: 1 }}
            >
              Reintentar
            </Button>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Escribe tu mensaje aquí..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={4}
          size="small"
          disabled={isLoading}
        />
        <Button
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
          onClick={handleSendMessage}
          disabled={isLoading || !inputValue.trim()}
        >
          Enviar
        </Button>
      </Box>
    </Paper>
  );
}; 