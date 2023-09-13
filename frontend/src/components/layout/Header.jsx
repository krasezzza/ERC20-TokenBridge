import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { useConnect, useAccount, useBalance } from 'wagmi';
import { NavLink } from "react-router-dom";
import { disconnect } from '@wagmi/core';
import { sepolia } from 'wagmi/chains';

import { useState, useEffect } from 'react';
import { truncate } from '../../utils';
import { toast } from 'react-toastify';
import Button from '../Button';

// const md5 = require('md5');

export default function Header() {
  const connector = new MetaMaskConnector({
    chains: [sepolia],
    options: {
      shimDisconnect: true,
      // UNSTABLE_shimOnConnectSelectAccount: true,
    },
  });

  const { isConnected, address } = useAccount();
  const { connect, isLoading } = useConnect({ connector });
  const { data } = useBalance({ address });

  const handleConnect = () => {
    connect();
    setWagmiConnected(true);
    toast.success('Connected successfully.', { autoClose: 1500 });
  };

  const handleDisconnect = async () => {
    await disconnect();
    setWagmiConnected(false);
    toast.warning('Disconnecting from MetaMask...', { autoClose: 1500 });
  };

  const [ wagmiConnected, setWagmiConnected ] = useState(
    isConnected && localStorage?.getItem('wagmi.connected') === 'true'
  );

  useEffect(() => {
    const manageConnection = async () => {
      if (wagmiConnected) {
        try {
          connect();
        } catch (err) {
          console.log(err);
          toast.error(err.message, { autoClose: 4500 });
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
              <div className="d-flex px-0 px-sm-6 pt-3 pt-sm-0">
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
            {wagmiConnected ? (
              <div className="d-block">
                <div className="d-flex">
                  {!!address && (<span>{truncate(address, 6)}</span>)}

                  <span className="logout-icon ms-3" 
                        onClick={handleDisconnect} 
                        title="Disconnect">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                      <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                    </svg>
                  </span>
                </div>

                <div className="d-flex justify-content-end pt-4 pt-sm-2">
                  <span className="text-small pe-2">Balance:</span>

                  <span className="text-small fw-bold">{Number(data && data.formatted).toFixed(3)} ETH</span>
                </div>
              </div>
            ) : (
              <Button 
                onClick={ handleConnect } 
                loading={ isLoading } 
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
