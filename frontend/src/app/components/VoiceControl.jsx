"use client";
import React from 'react';
import { useVoiceCommands } from './VoiceCommandProvider';
import { FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

export default function VoiceControl({ className = "" }) {
    const { 
        isListening, 
        voiceEnabled, 
        toggleListening, 
        toggleVoiceEnabled 
    } = useVoiceCommands();

    return (
        <div className={`voice-control flex items-center gap-2 ${className}`}>
            <button
                onClick={toggleVoiceEnabled}
                className={`p-2 rounded-full ${voiceEnabled ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}
                title={voiceEnabled ? "Disable voice commands" : "Enable voice commands"}
                aria-label={voiceEnabled ? "Disable voice commands" : "Enable voice commands"}
            >
                {voiceEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
            </button>
            
            {voiceEnabled && (
                <button
                    onClick={toggleListening}
                    className={`p-2 rounded-full ${isListening ? 'bg-green-500 text-white animate-pulse' : 'bg-gray-300 text-gray-600'}`}
                    title={isListening ? "Stop listening" : "Start listening"}
                    aria-label={isListening ? "Stop listening" : "Start listening"}
                    disabled={!voiceEnabled}
                >
                    {isListening ? <FaMicrophone /> : <FaMicrophoneSlash />}
                </button>
            )}
        </div>
    );
} 