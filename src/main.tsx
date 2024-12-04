import './index.css';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import LoadingScreen from './Loading.tsx';

createRoot(document.getElementById('root')!).render(
  //so it can cast shadows
  <>
    <Canvas shadows>
      <Suspense fallback={<LoadingScreen />}>
        <App />
      </Suspense>
    </Canvas>
  </>,
);
