import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Typography, Paper, CircularProgress, IconButton, Chip } from '@mui/material';;;;;
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { clinicalAIService } from '../../services/ai/ClinicalAIService';;;;;
import { MedicalSpecialty } from '../../services/ai/types';;;;;

// Definir tipos de mensajes para el chat
interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  references?: {
    title: string;
    url: string;
    year: number;
  }[];
}

interface AIAssistantChatProps {
  patientId: string;
  activeSection: string;
  specialty?: MedicalSpecialty;
  onMessageProcessed?: (query: string, response: string) => void;
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

  // Configurar el servicio de IA al montar el componente
  useEffect(() => {
    clinicalAIService.setContext({
      specialty,
      currentSection: activeSection,
      patientContext: {
        patientId
      }
    });
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
      const response = await clinicalAIService.processQuery(inputValue);

      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        content: response.content,
        sender: 'assistant',
        timestamp: new Date(),
        references: response.references
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

  const handleClearConversation = (): void => {
    setMessages([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          flex: 1, 
          mb: 2, 
          p: 2, 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              mb: 2
            }}
          >
            <Box
              sx={{
                maxWidth: '70%',
                p: 2,
                borderRadius: 2,
                bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                color: message.sender === 'user' ? 'white' : 'text.primary'
              }}
            >
              <Typography variant="body1">{message.content}</Typography>
              {message.references && message.references.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  {message.references.map((ref, index) => (
                    <Chip
                      key={index}
                      label={`${ref.title} (${ref.year})`}
                      size="small"
                      component="a"
                      href={ref.url}
                      target="_blank"
                      clickable
                      sx={{ mr: 1, mt: 1 }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Paper>

      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton
          onClick={handleClearConversation}
          color="default"
          size="small"
          title="Limpiar conversación"
        >
          <DeleteIcon />
        </IconButton>

        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escribe tu consulta..."
          disabled={isLoading}
          sx={{ flex: 1 }}
        />

        <Button
          variant="contained"
          onClick={handleSendMessage}
          disabled={isLoading || !inputValue.trim()}
          endIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
        >
          Enviar
        </Button>
      </Box>
    </Box>
  );
}; 