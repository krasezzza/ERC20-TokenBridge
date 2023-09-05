import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { useConnect, useAccount, useBalance } from 'wagmi';
import { NavLink } from "react-router-dom";
import { sepolia } from 'wagmi/chains';

import Button from '../ui/Button';
import { truncate } from '../../utils';

const md5 = require('md5');

function Header() {
  const connector = new MetaMaskConnector({
    chains: [sepolia],
    options: {
      shimDisconnect: true,
      UNSTABLE_shimOnConnectSelectAccount: true,
    },
  });

  const { isConnected, address } = useAccount();

  const { connect, isLoading } = useConnect({
    connector,
  });

  const { data } = useBalance({
    address
  });

  const handleConnect = () => {
    connect();
  };

  return (
    <div className="header-wrapper">
      <div className="header">
        <div className="container d-flex justify-content-between align-item-center">
          <NavLink to="/">
            <img
              src="https://limeacademy.tech/wp-content/uploads/2021/08/limeacademy_logo.svg"
              alt=""
            />
          </NavLink>

          <div className="d-flex">
            {isLoading ? (
              <span>Loading...</span>
            ) : isConnected ? (
              <div className="d-flex align-items-center justify-content-end">
                <img
                  className="img-profile me-3"
                  src={`https://www.gravatar.com/avatar/${md5(address)}/?d=identicon`}
                  alt=""
                />

                <span>{truncate(address, 6)}</span>
                <span className="mx-3">|</span>

                <p>
                  <span className="fw-bold">Balance: </span>
                  <span>{Number(data && data.formatted).toFixed(3)} ETH</span>
                </p>
              </div>
            ) : (
              <Button onClick={ handleConnect }>Connect Metamask</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
