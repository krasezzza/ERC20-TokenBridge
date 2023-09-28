import { useConnect, useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { fetchBalance, disconnect } from '@wagmi/core';
import { sepolia, goerli } from 'wagmi/chains';

import { useLocation, useNavigate, NavLink } from "react-router-dom";
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { truncate, networkProps } from '../../utils';
import NetworkSwitch from '../gui/NetworkSwitch';
import Disconnect from '../gui/Disconnect';
import Button from '../gui/Button';

const md5 = require('md5');

export default function Header() {

  const connector = new MetaMaskConnector({
    chains: [sepolia, goerli],
    options: {
      shimDisconnect: true,
      // UNSTABLE_shimOnConnectSelectAccount: true,
    },
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { chain } = useNetwork();
  const { chains, switchNetworkAsync } = useSwitchNetwork();
  const { connect, isLoading, isError } = useConnect({ connector });
  const { isConnected, address: walletAddress } = useAccount();
  
  const [ walletBalance, setWalletBalance ] = useState({
    formatted: "0",
    symbol: "ETH"
  });
  const [ wagmiConnected, setWagmiConnected ] = useState(
    isConnected && localStorage?.getItem('wagmi.connected') === 'true'
  );

  const handleConnect = () => {
    connect();
    setWagmiConnected(true);
  };

  const handleDisconnect = async () => {
    await disconnect();
    setWagmiConnected(false);
    toast.warning('Disconnecting from MetaMask...', { autoClose: 1000 });
  };

  const handleNetworkSwitch = async (newChainId) => {
    try {
      await switchNetworkAsync?.(newChainId);
      navigate('/claim', { replace: true });
    } catch(err) {
      console.error(err.message);
      toast.error(err.message.split('\n')[0], { autoClose: 4000 });
    }
  };

  useEffect(() => {
    if (!!walletAddress) {
      fetchBalance({ 
        address: walletAddress, 
        chainId: chain.id,
        token: networkProps(chain.network).tokenAddress
      }).then(res => {
        setWalletBalance(res);
      }).catch(err => {
        console.error(err.message);
        toast.error(err.message.split('\n')[0], { autoClose: 4000 });
      });
    }
    // eslint-disable-next-line
  }, [chain?.id, walletAddress, location]);

  useEffect(() => {
    const manageConnection = async () => {
      if (wagmiConnected) {
        try {
          connect();
        } catch (err) {
          console.error(err.message);
          toast.error(err.message, { autoClose: 4000 });
        }
      }
    };
    manageConnection();
    // eslint-disable-next-line
  }, [wagmiConnected]);

  return (
    <div className="header-wrapper">
      <div className="header">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex flex-column flex-sm-row align-items-sm-center">
            <NavLink to="/">
              <img
                src="https://limeacademy.tech/wp-content/uploads/2021/08/limeacademy_logo.svg"
                alt="lime-academy-logo-header"
              />
            </NavLink>

            {wagmiConnected && (
              <div className="d-flex px-0 px-sm-6 pt-2 pt-sm-0">
                <NavLink to="/transfer" className="fw-bold mx-3">
                  Transfer
                </NavLink>

                <NavLink to="/claim" className="fw-bold mx-3">
                  Claim
                </NavLink>
              </div>
            )}
          </div>

          <div className="d-flex">
            {wagmiConnected && !!walletAddress ? (
              <div className="d-block text-end">
                <NavLink to="/history">
                  <img
                    className="img-profile me-3"
                    src={`https://www.gravatar.com/avatar/${md5(walletAddress)}/?d=identicon`}
                    alt="chain-address-logo"
                  />
                  <span>{truncate(walletAddress, 12)}</span>
                </NavLink>

                <br />

                <div className="d-flex justify-content-end mt-2">
                  <span className="fw-bold mx-1">
                    {Number(walletBalance.formatted).toFixed(1)}
                  </span>
                  <span className="fw-bold mx-1">
                    {walletBalance.symbol}
                  </span>

                  <span className="px-3">|</span>

                  {chains.map((newChain) => {
                    return newChain.id !== chain?.id && (
                      <span key={newChain.id}>
                        <span className="me-2">{chain?.name}</span>

                        <span className="network-icon" 
                          onClick={() => handleNetworkSwitch(newChain.id)} 
                          title={`Switch to ${newChain.name}`}>
                            <NetworkSwitch />
                        </span>
                      </span>
                    );
                  })}

                  <span className="logout-icon" 
                    onClick={handleDisconnect} 
                    title="Disconnect from MetaMask">
                      <Disconnect />
                  </span>
                </div>
              </div>
            ) : (
              <Button 
                onClick={handleConnect} 
                loading={isLoading || isError} 
                loadingText="Connecting...">
                  Connect
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
