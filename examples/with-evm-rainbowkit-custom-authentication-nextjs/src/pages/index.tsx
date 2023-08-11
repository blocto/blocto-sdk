'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import SendTransaction from '../component/SendTransaction';
import SignMessage from '../component/SignMessage';
import SignTypedData from '../component/SignTypedData';

export default function Home() {
  const { isConnected } = useAccount();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, [isConnected]);

  return (
    <>
      <Link href="/test">To test page</Link>
      {isClient && isConnected && (
        <div className="login-wrap">
          {isConnected && (
            <>
              <SendTransaction />
              <SignMessage />
              <SignTypedData />
            </>
          )}
        </div>
      )}
    </>
  );
}
