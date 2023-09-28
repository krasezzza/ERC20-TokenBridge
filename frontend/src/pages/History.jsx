import Table from 'react-bootstrap/Table';

import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { useNetwork } from 'wagmi';

import { BridgeService } from "../services";
import { capitalize, truncate } from '../utils';
import Loading from "../components/gui/Loading";
import ItemsPagination from "../components/gui/ItemsPagination";


export default function History() {

  const { chain } = useNetwork();
  const [isLoading, setIsLoading] = useState(false);
  const [transferRecords, setTransferRecords] = useState([]);
  const [currentPageItems, setCurrentPageItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const bridgeService = new BridgeService(chain?.network);

      await bridgeService.fetchClaimedRecords().then((results) => {
        setTransferRecords([...results]);
      }).catch((err) => {
        console.error(err.message);
        toast.error(err.message, { autoClose: 4000 });
      });

      setIsLoading(false);
    };

    fetchData();
    // eslint-disable-next-line
  }, [chain, transferRecords.length]);

  const handleCallback = (items) => {
    setCurrentPageItems(items);
  };

  return (
    <div className="container pt-6">
      <h1 className="text-center">My Transactions</h1>

      {isLoading ? (<Loading />) : (
        <div className="content-wrapper">
          <Table className="w-75 mx-auto mt-6 mb-3" responsive="sm" hover={true} striped>
            <thead>
              <tr className="text-center">
                <th>Token</th>
                <th>Source</th>
                <th>Target</th>
              </tr>
            </thead>

            <tbody>
              {currentPageItems.length ? (
                currentPageItems.map(transfer => (
                  <tr className="text-center align-middle" key={transfer.id}>
                    <td>
                      <span>{transfer.tokenAmount} {transfer.tokenSymbol}</span>
                      <br />
                      <span>{truncate(transfer.tokenAddress, 9)}</span>
                    </td>

                    <td>
                      <span>{capitalize(transfer.fromNetwork)}</span>
                      <br />
                      <span>{truncate(transfer.fromWallet, 9)}</span>
                    </td>

                    <td>
                      <span>{capitalize(transfer.toNetwork)}</span>
                      <br />
                      <span>{truncate(transfer.toWallet, 9)}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="text-center align-middle">
                  <td colSpan={3}>No records currently.</td>
                </tr>
              )}
            </tbody>
          </Table>

          <ItemsPagination 
            records={transferRecords} 
            setPageItemsCallback={handleCallback} />
        </div>
      )}
    </div>
  );
};
