import { useAccount } from 'wagmi';
import SendTransaction from './components/SendTransaction';
import SignMessage from './components/SignMessage';
import SignTypedData from './components/SignTypedData';

export default function App() {
  const { isConnected } = useAccount();

  return (
    <div className="App">
      <div className="login-wrap">
        {isConnected && (
          <>
            <SendTransaction />
            <SignMessage />
            <SignTypedData />
          </>
        )}
      </div>
    </div>

  );
}
