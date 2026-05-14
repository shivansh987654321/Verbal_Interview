import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { setAuthToken, syncUser, startInterview, endInterview, sendMessage } from '../services/api';
import { speakText, cancelSpeech } from '../utils/speech';

const InterviewContext = createContext(null);

export function InterviewProvider({ children }) {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [interviewId, setInterviewId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [interviewActive, setInterviewActive] = useState(false);

  const getAuthHeaders = useCallback(async () => {
    const token = await getToken();
    setAuthToken(token);
    return token;
  }, [getToken]);

  const initUser = useCallback(async () => {
    await getAuthHeaders();
    await syncUser({
      clerkId: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      name: user.fullName,
      profileImageUrl: user.imageUrl,
    });
  }, [getAuthHeaders, user]);

  const beginInterview = useCallback(async (role) => {
    await getAuthHeaders();
    await initUser();

    const res = await startInterview({ clerkId: user.id, role });
    const { interviewId: id, firstMessage } = res.data;

    setInterviewId(id);
    setMessages([{ sender: 'AI', content: firstMessage, timestamp: new Date().toISOString() }]);
    setInterviewActive(true);

    speakText(firstMessage);

    return id;
  }, [getAuthHeaders, initUser, user]);

  const submitAnswer = useCallback(async (userText) => {
    if (!interviewId || !userText.trim()) return;

    const userMsg = { sender: 'USER', content: userText, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      await getAuthHeaders();
      const res = await sendMessage({ interviewId, message: userText });
      const { aiResponse } = res.data;
      const aiMsg = { sender: 'AI', content: aiResponse, timestamp: new Date().toISOString() };
      setMessages((prev) => [...prev, aiMsg]);
      speakText(aiResponse);
    } finally {
      setIsLoading(false);
    }
  }, [interviewId, getAuthHeaders]);

  const finishInterview = useCallback(async () => {
    if (!interviewId) return;
    cancelSpeech();
    await getAuthHeaders();
    await endInterview(interviewId);
    setInterviewActive(false);
  }, [interviewId, getAuthHeaders]);

  // Stop any ongoing speech when leaving the interview room
  useEffect(() => {
    return () => cancelSpeech();
  }, []);

  return (
    <InterviewContext.Provider value={{
      interviewId,
      messages,
      isLoading,
      interviewActive,
      beginInterview,
      submitAnswer,
      finishInterview,
    }}>
      {children}
    </InterviewContext.Provider>
  );
}

export const useInterview = () => {
  const ctx = useContext(InterviewContext);
  if (!ctx) throw new Error('useInterview must be used inside InterviewProvider');
  return ctx;
};
