import { useState } from 'react';
import { useAccount, useContractRead } from "wagmi";
import { NavLink } from 'react-router-dom';

function Home() {
  const { isConnected } = useAccount();

  const isLoading = false;
  const isFailure = "";

  return (
    <div className="container my-6">
      <h1>ERC20 Token Bridge</h1>

      <div className="mt-3">
        {!isConnected ? (
          <div className="mt-4">You have to log in first!</div>
        ) : (
          <div className="my-4">
            {isLoading ? (
              <div className="mt-2">Loading...</div>
            ) : (
              <div className="mt-2">There is nothing to be loaded at the moment.</div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8">
        <NavLink to="/styleguide" className="btn btn-primary">
          See styleguide
        </NavLink>
      </div>

      {!!isFailure && (
        <div className="mt-6">
          <p className="text-danger">{ isFailure }</p>
        </div>
      )}
    </div>
  );
}

export default Home;
