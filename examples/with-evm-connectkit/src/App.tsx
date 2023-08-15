import { ConnectKitButton } from 'connectkit';
import { useAccount } from 'wagmi';
import SignMessage from './components/SignMessage';
import SendTransaction from './components/SendTransaction';

function App() {
  const { isConnected } = useAccount();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        height: '100vh',
      }}
    >
      <ConnectKitButton />

      {isConnected && (
        <>
          <SendTransaction />
          <SignMessage />
        </>
      )}
    </div>
  );
}

export default App;
