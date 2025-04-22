"use client";
import React, { useEffect, useRef } from 'react';
import { useVoiceCommands } from './VoiceCommandProvider';

export default function VoiceElement({ 
    id, 
    description, 
    children, 
    onClick, 
    className = '',
    isInput = false
}) {
    const { registerVoiceElement, unregisterVoiceElement, setActiveInputField } = useVoiceCommands();
    const elementRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        // Find the input element if this is an input VoiceElement
        if (isInput && elementRef.current) {
            inputRef.current = elementRef.current.querySelector('input');
        }

        // Register with the actual input element for input VoiceElements
        const element = isInput ? inputRef : elementRef;
        if (id) {
            registerVoiceElement(id, description, element);
            return () => unregisterVoiceElement(id);
        }
    }, [id, description, registerVoiceElement, unregisterVoiceElement, isInput]);

    useEffect(() => {
        if (isInput && inputRef.current) {
            const input = inputRef.current;
            const handleFocus = () => setActiveInputField(id);
            const handleBlur = () => setActiveInputField(null);

            input.addEventListener('focus', handleFocus);
            input.addEventListener('blur', handleBlur);

            return () => {
                input.removeEventListener('focus', handleFocus);
                input.removeEventListener('blur', handleBlur);
            };
        }
    }, [id, isInput, setActiveInputField]);

    const handleClick = (e) => {
        if (onClick) {
            onClick(e);
        }
        if (isInput && inputRef.current) {
            inputRef.current.focus();
            setActiveInputField(id);
        }
    };

    return (
        <div 
            ref={elementRef}
            onClick={handleClick}
            className={`${className} ${onClick ? 'cursor-pointer' : ''}`}
        >
            {children}
        </div>
    );
} 