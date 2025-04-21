"use client";
import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { usePathname } from 'next/navigation';

const VoiceCommandContext = createContext();

export function useVoiceCommands() {
    return useContext(VoiceCommandContext);
}

export default function VoiceCommandProvider({ children }) {
    const [isListening, setIsListening] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [voiceElements, setVoiceElements] = useState({});
    const [processingCommand, setProcessingCommand] = useState(false);
    const [lastCommand, setLastCommand] = useState('');
    const [message, setMessage] = useState('');
    const [activeField, setActiveField] = useState(null);
    const pathname = usePathname();
    const messageTimeoutRef = useRef(null);
    
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    // Function to safely set message with cleanup
    const setMessageWithCleanup = useCallback((newMessage) => {
        // Clear any existing timeout
        if (messageTimeoutRef.current) {
            clearTimeout(messageTimeoutRef.current);
        }
        // Clear current message
        setMessage('');
        // Set new message after a brief delay
        messageTimeoutRef.current = setTimeout(() => {
            setMessage(newMessage);
        }, 100);
    }, []);

    // Cleanup on unmount or route change
    useEffect(() => {
        return () => {
            if (messageTimeoutRef.current) {
                clearTimeout(messageTimeoutRef.current);
            }
            setMessage('');
            setLastCommand('');
            setProcessingCommand(false);
            setActiveField(null);
        };
    }, [pathname]);

    // Initialize voice state from localStorage
    useEffect(() => {
        const savedVoiceState = localStorage.getItem('voiceEnabled');
        const savedListeningState = localStorage.getItem('isListening');
        
        if (savedVoiceState !== null) {
            const isEnabled = savedVoiceState === 'true';
            setVoiceEnabled(isEnabled);
            
            // If voice is enabled and was previously listening, start listening
            if (isEnabled && savedListeningState === 'true') {
                SpeechRecognition.startListening({ continuous: true });
                setIsListening(true);
                setMessageWithCleanup("Listening for commands...");
            }
        }
    }, []);

    // Register a voice-enabled element with an ID and description
    const registerVoiceElement = useCallback((id, description, element) => {
        setVoiceElements(prev => ({
            ...prev,
            [id]: { description, element }
        }));
    }, []);

    // Unregister a voice element when it unmounts
    const unregisterVoiceElement = useCallback((id) => {
        setVoiceElements(prev => {
            const newElements = { ...prev };
            delete newElements[id];
            return newElements;
        });
    }, []);

    // Set active field for input commands
    const setActiveInputField = useCallback((fieldId) => {
        setActiveField(fieldId);
    }, []);

    // Process voice commands
    useEffect(() => {
        if (!isListening || !transcript || processingCommand) return;

        const processCommand = async () => {
            setProcessingCommand(true);
            setLastCommand(transcript);
            
            // Clear current message
            setMessage('');
            
            const commandText = transcript.toLowerCase();
            
            // Handle input commands first
            if (commandText.startsWith('input ') && activeField) {
                let inputValue = commandText.replace('input ', '').trim();
                
                if (activeField === 'phone-input') {
                    inputValue = inputValue.replace(/\s+/g, '');
                } else if (/^\d+(?:\s+\d+)*$/.test(inputValue)) {
                    inputValue = inputValue.replace(/\s+/g, '');
                }

                const element = voiceElements[activeField]?.element;
                if (element && element.current) {
                    element.current.value = inputValue;
                    const inputEvent = new Event('input', { bubbles: true });
                    Object.defineProperty(inputEvent, 'target', {
                        writable: false,
                        value: element.current
                    });
                    element.current.dispatchEvent(inputEvent);

                    const changeEvent = new Event('change', { bubbles: true });
                    Object.defineProperty(changeEvent, 'target', {
                        writable: false,
                        value: element.current
                    });
                    element.current.dispatchEvent(changeEvent);

                    setMessageWithCleanup(`Input: "${inputValue}"`);
                    resetTranscript();
                    setProcessingCommand(false);
                    return;
                }
            }
            
            // Match command to registered elements
            let matchFound = false;
            
            Object.entries(voiceElements).forEach(([id, { description, element }]) => {
                if (matchFound) return;
                
                const descriptionLower = description.toLowerCase();
                const actionVerbs = ['click', 'select', 'choose', 'unselect', 'deselect', 'focus'];
                const hasMatch = actionVerbs.some(verb => 
                    commandText.includes(`${verb} ${descriptionLower}`) || 
                    commandText.includes(descriptionLower)
                );
                
                if (hasMatch) {
                    matchFound = true;
                    if (element && element.current) {
                        element.current.click();
                        setMessageWithCleanup(`Executed: "${description}"`);
                    }
                }
            });
            
            if (!matchFound) {
                return ;   }
            
            resetTranscript();
            setProcessingCommand(false);
        };

        const timer = setTimeout(() => {
            processCommand();
        }, 1000);

        return () => clearTimeout(timer);
    }, [transcript, isListening, processingCommand, resetTranscript, voiceElements, activeField, setMessageWithCleanup]);

    // Toggle voice functionality
    const toggleVoiceEnabled = useCallback(() => {
        const newState = !voiceEnabled;
        setVoiceEnabled(newState);
        localStorage.setItem('voiceEnabled', newState.toString());
        
        if (newState) {
            setMessageWithCleanup("Voice commands enabled");
            if (localStorage.getItem('isListening') === 'true') {
                SpeechRecognition.startListening({ continuous: true });
                setIsListening(true);
                setMessageWithCleanup("Listening for commands...");
            }
        } else {
            if (isListening) {
                SpeechRecognition.stopListening();
                setIsListening(false);
                localStorage.setItem('isListening', 'false');
            }
            setMessageWithCleanup("Voice commands disabled");
        }
    }, [voiceEnabled, isListening, setMessageWithCleanup]);

    // Toggle listening
    const toggleListening = useCallback(() => {
        if (!browserSupportsSpeechRecognition) {
            setMessageWithCleanup("Your browser doesn't support speech recognition.");
            return;
        }

        if (isListening) {
            SpeechRecognition.stopListening();
            setMessageWithCleanup("Voice commands paused");
            localStorage.setItem('isListening', 'false');
        } else {
            SpeechRecognition.startListening({ continuous: true });
            setMessageWithCleanup("Listening for commands...");
            localStorage.setItem('isListening', 'true');
        }
        
        setIsListening(prev => !prev);
    }, [isListening, browserSupportsSpeechRecognition, setMessageWithCleanup]);

    // Provide value to context
    const contextValue = {
        isListening,
        voiceEnabled,
        message,
        lastCommand,
        activeField,
        toggleListening,
        toggleVoiceEnabled,
        registerVoiceElement,
        unregisterVoiceElement,
        setActiveInputField
    };

    return (
        <VoiceCommandContext.Provider value={contextValue}>
            {voiceEnabled && message && (
                <div className="fixed top-20 right-5 z-50 bg-black bg-opacity-70 text-white p-2 rounded-md">
                    <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${isListening ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <span className="text-sm">{message}</span>
                    </div>
                </div>
            )}
            {children}
        </VoiceCommandContext.Provider>
    );
} 