import "./App.css";
import {
  DynamicContextProvider,
  DynamicWidget,
  SortWallets
} from "@dynamic-labs/sdk-react";

const App = () => (
  <DynamicContextProvider
    settings={{
      environmentId: "00a1538b-747f-4caf-a499-e960b7bf07a1",
      walletsFilter: SortWallets(["bloctoevm", "walletconnect", "metamask"]),
      defaultNumberOfWalletsToShow: 3,
      newToWeb3WalletChainMap: {
        primary_chain: "evm",
        wallets: {
          evm: "bloctoevm"
        }
      }
    }}
  >
    <DynamicWidget />
  </DynamicContextProvider>
);

export default App;
