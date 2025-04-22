"use client";
import React from 'react';
import VoiceCommandProvider from './VoiceCommandProvider';

export default function VoiceLayer({ children }) {
    return (
        <VoiceCommandProvider>
            {children}
        </VoiceCommandProvider>
    );
} 