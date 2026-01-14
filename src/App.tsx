import PongGame from '@/src/PongGame';

function App() {
  return (
    <div className="min-h-screen bg-[#0a0a12] bg-[radial-gradient(ellipse_at_20%_20%,rgba(255,107,107,0.08)_0%,transparent_50%),radial-gradient(ellipse_at_80%_80%,rgba(78,205,196,0.08)_0%,transparent_50%),linear-gradient(180deg,#0a0a12_0%,#121220_100%)] text-white flex justify-center items-center">
      <PongGame />
    </div>
  );
}

export default App;
