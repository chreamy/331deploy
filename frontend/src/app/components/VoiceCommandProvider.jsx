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
    const isInitialized = useRef(false);
    
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    // Function to set message with auto-clear
    const setMessageWithTimeout = useCallback((newMessage, timeout = 2000) => {
        setMessage(newMessage);
        if (messageTimeoutRef.current) {
            clearTimeout(messageTimeoutRef.current);
        }
        if (timeout) {
            messageTimeoutRef.current = setTimeout(() => {
                setMessage('');
            }, timeout);
        }
    }, []);

    // Update message when listening state changes
    useEffect(() => {
        if (isListening) {
            setMessage('Listening...');
        } else {
            setMessage('');
        }
    }, [isListening]);

    // Initialize voice state from localStorage
    useEffect(() => {
        if (isInitialized.current) return;
        
        const savedVoiceState = localStorage.getItem('voiceEnabled');
        const savedListeningState = localStorage.getItem('isListening');
        
        if (savedVoiceState !== null) {
            const isEnabled = savedVoiceState === 'true';
            setVoiceEnabled(isEnabled);
            
            if (isEnabled && savedListeningState === 'true') {
                SpeechRecognition.startListening({ continuous: true });
                setIsListening(true);
            }
        }
        
        isInitialized.current = true;
    }, []);

    // Restart listening when route changes if it was previously listening
    useEffect(() => {
        if (voiceEnabled && localStorage.getItem('isListening') === 'true') {
            SpeechRecognition.startListening({ continuous: true });
            setIsListening(true);
        }
    }, [pathname, voiceEnabled]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (messageTimeoutRef.current) {
                clearTimeout(messageTimeoutRef.current);
            }
            setMessage('');
            setLastCommand('');
            setProcessingCommand(false);
            setActiveField(null);
            
            // Ensure processing is stopped
            if (processingCommand) {
                setProcessingCommand(false);
            }
        };
    }, [pathname, processingCommand]);

    // Additional effect to handle route changes
    useEffect(() => {
        setProcessingCommand(false);
    }, [pathname]);

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
            
            // Show user's last command for 2 seconds
            setMessageWithTimeout(transcript);
            
            const commandText = transcript.toLowerCase();
            
            // Handle input commands first
            if (commandText.startsWith('input ') && activeField) {
                console.log('Active Field:', activeField);
                console.log('Voice Elements:', voiceElements);

                // Extract the value after "input"
                let value = commandText.slice(6).trim();
                
                // If this is a phone input, remove all spaces and non-numeric characters
                if (activeField === 'phone-input') {
                    value = value.replace(/[^0-9]/g, '');
                    console.log('Formatted phone number:', value);
                }
                
                console.log('Processing voice command - Value:', value);

                const element = voiceElements[activeField]?.element;
                if (element?.current) {
                    console.log('Found input element:', element.current);
                    
                    try {
                        // Create and dispatch input event with value
                        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                            window.HTMLInputElement.prototype,
                            "value"
                        ).set;
                        nativeInputValueSetter.call(element.current, value);
                        
                        const inputEvent = new Event('input', { bubbles: true });
                        element.current.dispatchEvent(inputEvent);
                        
                        console.log('Input event dispatched');
                        
                        // Create and dispatch change event
                        const changeEvent = new Event('change', { bubbles: true });
                        element.current.dispatchEvent(changeEvent);
                        
                        console.log('Change event dispatched');
                        
                        // Trigger a focus event to ensure the input is active
                        element.current.focus();
                        
                        console.log('Final input value:', element.current.value);
                    } catch (error) {
                        console.error('Error updating input:', error);
                    }
                } else {
                    console.warn('No active input element found. Active field:', activeField);
                    console.warn('Available voice elements:', Object.keys(voiceElements));
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
                    }
                }
            });
            
            resetTranscript();
            setProcessingCommand(false);
        };

        const timer = setTimeout(() => {
            processCommand();
        }, 1000);

        return () => clearTimeout(timer);
    }, [transcript, isListening, processingCommand, resetTranscript, voiceElements, activeField, setMessageWithTimeout]);

    // Toggle voice functionality
    const toggleVoiceEnabled = useCallback(() => {
        const newState = !voiceEnabled;
        setVoiceEnabled(newState);
        localStorage.setItem('voiceEnabled', newState.toString());
        
        if (newState) {
            if (localStorage.getItem('isListening') === 'true') {
                SpeechRecognition.startListening({ continuous: true });
                setIsListening(true);
            }
        } else {
            if (isListening) {
                SpeechRecognition.stopListening();
                setIsListening(false);
                localStorage.setItem('isListening', 'false');
            }
        }
    }, [voiceEnabled, isListening]);

    // Toggle listening
    const toggleListening = useCallback(() => {
        if (!browserSupportsSpeechRecognition) return;

        if (isListening) {
            SpeechRecognition.stopListening();
            localStorage.setItem('isListening', 'false');
        } else {
            SpeechRecognition.startListening({ continuous: true });
            localStorage.setItem('isListening', 'true');
        }
        
        setIsListening(prev => !prev);
    }, [isListening, browserSupportsSpeechRecognition]);

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