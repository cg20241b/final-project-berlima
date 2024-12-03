import './index.css';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  //so it can cast shadows
  <Canvas shadows>
    <Suspense fallback={null}>
      <App />
    </Suspense>
  </Canvas>,
);
