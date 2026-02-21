'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import MainArea from '@/components/MainArea';

export default function DashboardPage() {
  const [selectedMode, setSelectedMode] = useState<string>('Generate Notes');
  const [output, setOutput] = useState<string>('');

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <Sidebar selectedMode={selectedMode} onSelectMode={setSelectedMode} />
      <MainArea selectedMode={selectedMode} output={output} setOutput={setOutput} />
    </div>
  );
}
