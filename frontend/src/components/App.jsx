import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { infuraProvider } from 'wagmi/providers/infura';
import { sepolia } from 'wagmi/chains';

import Header from './layout/Header';
import Footer from './layout/Footer';

import Home from '../pages/Home';
import Styleguide from '../pages/Styleguide';
import ProtectedRoute from './ProtectedRoute';

function App() {
  const { publicClient, webSocketPublicClient } = configureChains(
    [sepolia],
    [infuraProvider({
      apiKey: process.env.REACT_APP_INFURA_API_KEY
    })],
  );

  const config = createConfig({
    autoConnect: true,
    publicClient,
    webSocketPublicClient,
  });

  return (
    <WagmiConfig config={config}>
      <BrowserRouter>
        <div className="wrapper">
          <Header />

          <div className="main">
              <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/styleguide" element={<Styleguide />} />
              </Routes>
          </div>

          <Footer />
        </div>
      </BrowserRouter>
    </WagmiConfig>
  );
}

export default App;
