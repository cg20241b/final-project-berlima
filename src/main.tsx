import './index.css';

// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  //so it can cast shadows
  <Canvas shadows>
    <Suspense fallback={null}>
      <App />
    </Suspense>
  </Canvas>,
);
