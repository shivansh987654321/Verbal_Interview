import React from 'react';
import { useParams } from 'react-router-dom';
import { InterviewProvider } from '../context/InterviewContext';
import InterviewRoom from '../components/interview/InterviewRoom';

export default function InterviewPage() {
  const { role } = useParams();

  return (
    <InterviewProvider>
      <InterviewRoom role={role} />
    </InterviewProvider>
  );
}
