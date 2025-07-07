'use client';

import React from 'react';
import './globals.css'; // Tailwind should already be imported here
import HeroSlider from '@/components/HeroSlider'; // Using alias import (recommended)

const App: React.FC = () => {
  return (
    <div className="bg-white">
      <HeroSlider />
    </div>
  );
};

export default App;
