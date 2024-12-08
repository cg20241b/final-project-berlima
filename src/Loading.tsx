import { Html, useProgress } from '@react-three/drei';

export default function LoadingScreen() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div
        style={{
          width: '100%',
          position: 'absolute',
          bottom: '5%',
          left: 0,
          zIndex: 999,
        }}
      >
        <div
          style={{
            width: '90%',
            margin: '0 auto 100px auto',
            padding: '0px 120px',
          }}
        >
          <h1
            style={{
              color: 'white',
              fontSize: '24px',
              fontWeight: 600,
            }}
          >
            Loading...
          </h1>
          <div
            style={{
              width: `${progress}%`,
              height: '24px',
              backgroundColor: 'white',
              border: '4px solid black',
            }}
          />
        </div>
      </div>
      <img src='/assets/images/loading.jpg' alt='loading' />
    </Html>
  );
}
