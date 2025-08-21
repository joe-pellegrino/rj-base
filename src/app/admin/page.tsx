"use client";

import thirdwebIcon from "@public/thirdweb.svg";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

import {
  ConnectButton,
  useReadContract,
  useSendTransaction,
  useActiveAccount,
  TransactionButton,
} from "thirdweb/react";
import { client } from "../client";
import { base } from "thirdweb/chains";
import {
  claimTo,
  getNFTs,
  getOwnedNFTs,
  safeTransferFrom,
} from "thirdweb/extensions/erc1155";
import { getContract } from "thirdweb";
import { inAppWallet } from "thirdweb/wallets";
import { CSVLink, CSVDownload } from "react-csv";

const wallets = [
  inAppWallet(
    // built-in auth methods
    // or bring your own auth endpoint
    {
      auth: {
        // options: ["google", "x", "discord", "wallet", "email"],
        options: ["email", "wallet", "google", "facebook"],
      },
      // optional execution mode, defaults to "EOA"
      // executionMode: {
      //   mode: "EIP7702", // or "EIP4337" or "EOA"
      //   sponsorGas: true, // sponsor gas for all transactions
      // },
      executionMode: {
        mode: "EIP4337",
        smartAccount: { chain: base, sponsorGas: true },
      },
    },
  ),
];

const contract = getContract({
  client,
  chain: base,
  address: "0x0F6e910aa43C79d73398B2Bd4303c52ccFee0D41",
});

export default function Home() {
  const account = useActiveAccount();
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [addresses, setAddresses] = useState<string[]>([]);
  const csvRef = useRef<any>(null);

  const {
    data: ownedNFTs,
    refetch: refetchOwnedNFTs,
    isLoading: isLoadingOwnedNFTs,
  } = useReadContract(getOwnedNFTs, {
    contract: contract,
    address: account?.address || "",
  });

  useEffect(() => {
    if (account) {
      if (
        account.address?.toLowerCase() ===
        "0x581ec6620e733f41926aa654c96dda2542b51a16"
      ) {
        setGateOpen(true);
        return;
      }
    }
  }, [account]);

  useEffect(() => {
    console.log("Gate open:", gateOpen);
    async function getWallets() {
      const result = await fetch("/api/getAllWalletAddresses", {
        method: "GET",
        headers: { "content-type": "application/json" },
      });

      result.json().then((data) => {
        if (data["data"].length > 0) {
          console.log("Wallets:", data["data"]);
          setAddresses(data["data"].map((item: any) => item.wallet_address));
        }
      });
    }

    if (gateOpen) {
      getWallets();
    }
  }, [gateOpen]);

  const handleDownload = () => {
    csvRef.current.link.click(); // programmatically trigger download
  };

  return (
    <>
      <div className="">
        <nav className="bg-black border-b border-gray-200 shadow-sm py-0">
          <div className="container mx-auto px-4 py-1 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="text-white text-2xl font-semibold">Admin</span>
            </div>
            {account && (
              <ConnectButton
                client={client}
                wallets={wallets}
                accountAbstraction={{ chain: base, sponsorGas: true }}
                appMetadata={{
                  name: "RJ Media Base",
                  url: "https://rjmediastudios.com",
                }}
              />
            )}
          </div>
        </nav>
      </div>
      <main className="p-4 pb-10 min-h-[90vh] flex items-center justify-center container max-w-screen-lg mx-auto">
        <div className="py-5 w-full">
          <div className="py-5 w-full text-center">
            {!account && (
              <>
                <div className="text-3xl font-bold mb-6 text-gray-800">
                  Login below
                </div>
                <ConnectButton
                  theme={"light"}
                  client={client}
                  wallets={wallets}
                  accountAbstraction={{ chain: base, sponsorGas: true }}
                  appMetadata={{
                    name: "RJ Media Base",
                    url: "https://rjmediastudios.com",
                  }}
                />
              </>
            )}
          </div>
          {/* <CSVLink className="hidden" ref={csvRef} data={addresses} />
          <button
            type="button"
            onClick={handleDownload}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Download CSV
          </button> */}
          <div className="flex flex-col justify-center mb-20 max-w-screen-lg">
            {gateOpen && addresses && (
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Address
                            </th>
                            {/* <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Title
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Email
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Role
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">Edit</span>
                            </th> */}
                          </tr>
                        </thead>
                        <tbody>
                          {addresses.map((address, idx) => (
                            <tr
                              key={address}
                              className={
                                idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {address}
                              </td>
                              {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {person.title}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {person.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {person.role}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <a
                                  href="#"
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Edit
                                </a>
                              </td> */}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Modal overlay */}
        {isSendModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 opacity-0 animate-fadeIn">
            {/* Modal box */}
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 text-black">
                Transfer NFT
              </h2>

              <p className="text-gray-600 mb-6">
                Input the wallet address below to transfer the NFT.
              </p>
              <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 inset-ring inset-ring-red-600/10">
                Be EXTREMELY careful when sending NFTs, as they cannot be
                recovered if sent to the wrong address.
              </span>
              <input
                type="text"
                placeholder="0x00000000000000000000000000000000000000"
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-black"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsSendModalOpen(false)}
                  className="mt-2 bg-red-500 font-bold text-white px-4 py-2 rounded-xl w-full"
                >
                  Cancel
                </button>

                <TransactionButton
                  transaction={() =>
                    safeTransferFrom({
                      contract,
                      from: account!.address,
                      to: "0x581EC6620e733f41926Aa654C96dDA2542B51A16",
                      tokenId: nft.id,
                      value: 1n,
                      data: "0x",
                    })
                  }
                  onTransactionConfirmed={() => {
                    alert("NFT sent!");
                    refetchOwnedNFTs();
                  }}
                  unstyled
                  onError={(err) => alert(err.message)}
                  className="mt-2 bg-black font-bold text-white px-4 py-2 rounded-xl w-full"
                >
                  Send
                </TransactionButton>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
