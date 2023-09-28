import { NavLink } from "react-router-dom";
import { useAccount } from 'wagmi';


export default function Home() {

  const { isConnected } = useAccount();

  return (
    <div className="container pt-6">
      <h1 className="text-center">ERC20 Token Bridge</h1>

      <div className="content-wrapper text-center">
        {!isConnected ? (
          <div className="my-3">You have to log in first!</div>
        ) : (
          <div className="my-3">
            <p className="my-6">You can use this bridge to transfer tokens between EVM based networks.</p>

            <div className="pt-5">
              <h6 className="mb-3">Start Bridging</h6>
              
              <NavLink to="/transfer" className="btn btn-primary my-3">
                Transfer Page
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
