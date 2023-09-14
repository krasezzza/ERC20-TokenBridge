import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { infuraProvider } from 'wagmi/providers/infura';
import { sepolia, goerli } from 'wagmi/chains';

import Header from './layout/Header';
import Footer from './layout/Footer';

import Home from '../pages/Home';
import Transfer from '../pages/Transfer';
import Claim from '../pages/Claim';
import Styleguide from '../pages/Styleguide';
import ProtectedRoute from './ProtectedRoute';
import { ToastContainer } from 'react-toastify';

export default function App() {

  const { publicClient, webSocketPublicClient } = configureChains(
    [sepolia, goerli],
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
              <Route path="/" element={ <Home /> } />

              <Route path="/transfer" element={
                <ProtectedRoute>
                  <Transfer />
                </ProtectedRoute>
              } />

              <Route path="/claim" element={
                <ProtectedRoute>
                  <Claim />
                </ProtectedRoute>
              } />

              <Route path="/styleguide" element={ <Styleguide /> } />

              <Route path="*" element={ <Navigate to="/" replace/> } />
            </Routes>
          </div>

          <ToastContainer />

          <Footer />
        </div>
      </BrowserRouter>
    </WagmiConfig>
  );
};
