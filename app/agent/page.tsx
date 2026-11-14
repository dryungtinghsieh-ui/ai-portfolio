import type { Metadata } from 'next';
import AgentClient from './page-client';

export const metadata: Metadata = {
  title: 'AI Agent',
  description: 'Explore research, calculate, and work through questions with a tool-using AI assistant.',
  alternates: { canonical: 'https://www.ythsieh.dev/agent' },
};

export default function AgentPage() { return <AgentClient />; }
