import React from 'react';
import { Transcript } from '../../types/voice';

interface TranscriptVisualizerProps {
  transcript: Transcript;
  onWordClick?: (word: string) => void;
  className?: string;
}

export const TranscriptVisualizer: React.FC<TranscriptVisualizerProps> = ({
  transcript,
  onWordClick,
  className = ''
}) => {
  const renderWord = (word: string, index: number) => {
    const isUnclear = transcript.unclearWords?.some(
      unclear => unclear.word.toLowerCase() === word.toLowerCase()
    );

    const handleClick = () => {
      if (isUnclear && onWordClick) {
        onWordClick(word);
      }
    };

    return (
      <span
        key={index}
        onClick={handleClick}
        className={`
          ${isUnclear ? 'underline decoration-dotted cursor-pointer' : ''}
          ${transcript.speaker ? `text-${transcript.speaker.color}-600` : 'text-gray-600'}
        `}
        title={isUnclear ? 'Palabra no clara - Click para alternativas' : ''}
      >
        {word}{' '}
      </span>
    );
  };

  return (
    <div className={`p-4 rounded-lg bg-white shadow ${className}`}>
      <div className="flex items-center mb-2">
        {transcript.speaker && (
          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-2 bg-${transcript.speaker.color}-500`}
            />
            <span className="font-medium">{transcript.speaker.name}</span>
          </div>
        )}
        <span className="text-sm text-gray-500 ml-auto">
          {transcript.timestamp.toLocaleTimeString()}
        </span>
      </div>
      <div className="text-gray-800">
        {transcript.text.split(' ').map(renderWord)}
      </div>
      {transcript.unclearWords && transcript.unclearWords.length > 0 && (
        <div className="mt-2 text-sm text-gray-500">
          <span className="font-medium">Palabras no claras: </span>
          {transcript.unclearWords.map((word, index) => (
            <span key={index} className="mr-2">
              {word.word}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}; 