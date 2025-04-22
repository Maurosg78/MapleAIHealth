import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Tabs, 
  Tab, 
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  LightBulbIcon,
  XIcon,
  DocumentTextIcon,
  SparklesIcon,
  ClipboardCheckIcon,
  ExclamationIcon,
  ClockIcon
} from '@heroicons/react/outline';
import { clinicalAIService } from '../../services/ai/ClinicalAIService';
import { AIAssistantChat } from './AIAssistantChat';
import { MedicalSpecialty } from '../../services/ai/types';

interface ClinicalAssistantProps {
  soapData: any;
  specialty: MedicalSpecialty;
  activeSection: string;
  patientId: string;
  onFieldFocus?: (section: string, field: string) => void;
}

interface Suggestion {
  id: string;
  type: 'clinical' | 'diagnostic' | 'alert' | 'documentation' | 'reminder';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  section?: string;
  field?: string;
}

export const ClinicalAssistant: React.FC<ClinicalAssistantProps> = ({
  soapData,
  specialty,
  activeSection,
  patientId,
  onFieldFocus
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSuggestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newSuggestions = await clinicalAIService.getSuggestions(soapData);
      setSuggestions(newSuggestions.map((suggestion, index) => ({
        id: `sug-${index}`,
        type: 'clinical',
        title: suggestion,
        description: suggestion,
        priority: 'medium'
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar sugerencias');
      console.error('Error al cargar sugerencias:', err);
    } finally {
      setIsLoading(false);
    }
  }, [soapData]);

  useEffect(() => {
    if (isExpanded) {
      loadSuggestions();
    }
  }, [isExpanded, loadSuggestions]);

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.section && suggestion.field && onFieldFocus) {
      onFieldFocus(suggestion.section, suggestion.field);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'clinical':
        return <SparklesIcon className="h-5 w-5" />;
      case 'diagnostic':
        return <ClipboardCheckIcon className="h-5 w-5" />;
      case 'alert':
        return <ExclamationIcon className="h-5 w-5" />;
      case 'documentation':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'reminder':
        return <ClockIcon className="h-5 w-5" />;
      default:
        return <LightBulbIcon className="h-5 w-5" />;
    }
  };

  return (
    <Paper 
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: isExpanded ? 400 : 56,
        height: isExpanded ? 600 : 56,
        borderRadius: 2,
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        zIndex: 1000
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 1,
        bgcolor: 'primary.main',
        color: 'white'
      }}>
        {isExpanded && (
          <Typography variant="subtitle1" sx={{ ml: 1 }}>
            Asistente Clínico
          </Typography>
        )}
        <IconButton
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{ color: 'white' }}
        >
          {isExpanded ? (
            <XIcon className="h-5 w-5" />
          ) : (
            <LightBulbIcon className="h-5 w-5" />
          )}
        </IconButton>
      </Box>

      {isExpanded && (
        <>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Sugerencias" />
            <Tab label="Chat" />
          </Tabs>

          <Box sx={{ height: 'calc(100% - 104px)', overflow: 'auto' }}>
            {activeTab === 0 ? (
              <List>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Typography color="error" sx={{ p: 2 }}>
                    {error}
                  </Typography>
                ) : suggestions.length === 0 ? (
                  <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                    No hay sugerencias disponibles
                  </Typography>
                ) : (
                  suggestions.map((suggestion) => (
                    <ListItem
                      key={suggestion.id}
                      button
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <ListItemIcon>
                        {getIconForType(suggestion.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={suggestion.title}
                        secondary={suggestion.description}
                      />
                      <Chip
                        size="small"
                        color={getPriorityColor(suggestion.priority)}
                        label={suggestion.priority}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            ) : (
              <Box sx={{ p: 2, height: '100%' }}>
                <AIAssistantChat
                  patientId={patientId}
                  specialty={specialty}
                  activeSection={activeSection}
                />
              </Box>
            )}
          </Box>
        </>
      )}
    </Paper>
  );
}; 