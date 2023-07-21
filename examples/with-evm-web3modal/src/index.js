import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Web3Modal } from "@web3modal/react";
import { WagmiConfig } from "wagmi";
import { wagmiConfig, projectId, ethereumClient } from "./wagmi";
import App from "./App";
import { BloctoWeb3ModalConfig } from "@blocto/wagmi-connector";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

function Index() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <>
      {ready ? (
        <WagmiConfig config={wagmiConfig}>
          <App />
        </WagmiConfig>
      ) : null}

      <Web3Modal
        {...BloctoWeb3ModalConfig}
        projectId={projectId}
        ethereumClient={ethereumClient}
      />
    </>
  );
}

root.render(<Index />);
