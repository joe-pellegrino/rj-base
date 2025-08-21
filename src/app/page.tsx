"use client";

import thirdwebIcon from "@public/thirdweb.svg";
import Image from "next/image";
import { useState } from "react";

import {
  ConnectButton,
  ConnectEmbed,
  useReadContract,
  useSendTransaction,
  useActiveAccount,
  useWalletInfo,
  MediaRenderer,
  TransactionButton,
} from "thirdweb/react";
import { client } from "./client";
import { base } from "thirdweb/chains";
import {
  claimTo,
  getNFTs,
  getOwnedNFTs,
  safeTransferFrom,
} from "thirdweb/extensions/erc1155";
import { getContract } from "thirdweb";
import { inAppWallet } from "thirdweb/wallets";

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
  const { mutate: sendTransaction } = useSendTransaction();
  const account = useActiveAccount();
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  const {
    data: nfts,
    isLoading: isLoadingNFTs,
    refetch: refreshAvailableNFTs,
  } = useReadContract(getNFTs, {
    contract: contract,
  });

  const {
    data: ownedNFTs,
    refetch: refetchOwnedNFTs,
    isLoading: isLoadingOwnedNFTs,
  } = useReadContract(getOwnedNFTs, {
    contract: contract,
    address: account?.address || "",
  });

  const transferNft = async (recipientAddress: string, tokenId: string) => {
    try {
      if (!contract) {
        console.error("Contract not loaded.");
        return;
      }
      await contract.call("safeTransferFrom", [
        account?.address,
        recipientAddress, // to
        tokenId, // id
        1n, // amount
        "0x", // data
      ]);
      console.log("NFT transferred successfully!");
    } catch (error) {
      console.error("Error transferring NFT:", error);
    }
  };

  return (
    <>
      <div className="">
        <nav className="bg-black border-b border-gray-200 shadow-sm py-0">
          <div className="container mx-auto px-4 py-1 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="text-white text-2xl font-semibold">
                RJ Media Agency Token
              </span>
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
                  Welcome! Login below to claim
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
          <div className="flex flex-col justify-center mb-20 max-w-screen-lg">
            {account && (
              <>
                <div className="relative">
                  <div className="w-full max-w-xl mx-auto mb-5">
                    <div className="text-2xl text-black font-bold">
                      Available NFTs
                    </div>
                    <button onClick={() => refreshAvailableNFTs()}>
                      Refresh Metadata
                    </button>
                  </div>
                  <div className="mx-auto grid gap-6 grid-cols-[repeat(auto-fit,minmax(280px,1fr))] justify-items-center max-w-6xl">
                    {isLoadingNFTs ? (
                      <div className="col-span-2 flex justify-center items-center py-12">
                        <span className="inline-block w-12 h-12 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></span>
                      </div>
                    ) : nfts && nfts.length > 0 ? (
                      nfts.map((nft) => {
                        const alreadyOwned = ownedNFTs?.some(
                          (owned) =>
                            owned.id === nft.id && owned.quantityOwned > 0,
                        );
                        return (
                          <div
                            key={nft.id}
                            className="relative bg-white border rounded-2xl shadow-md p-7 flex flex-col items-center hover:scale-[1.03] hover:shadow-lg transition-all duration-300 group w-full max-w-xs "
                          >
                            <div className="absolute top-4 right-4">
                              <span className="inline-block bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                                NFT
                              </span>
                            </div>
                            <div className="w-44 h-44 mb-5 flex items-center justify-center rounded-xl overflow-hidden border-2 border-gray transition-all">
                              <MediaRenderer
                                client={client}
                                src={nft.metadata.image}
                              />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-800 text-center">
                              {nft.metadata.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                              {nft.metadata.description}
                            </p>
                            <TransactionButton
                              transaction={() =>
                                claimTo({
                                  contract: contract,
                                  to: account?.address || "",
                                  tokenId: nft.id,
                                  quantity: BigInt(1),
                                })
                              }
                              onTransactionConfirmed={() => {
                                alert("NFT claimed!");
                                refetchOwnedNFTs();
                              }}
                              onError={(error) => {
                                alert(error.message);
                              }}
                              unstyled
                              disabled={alreadyOwned}
                              className={`bg-blue-500 w-full hover:from-indigo-600 hover:to-blue-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-all duration-200 mt-2 ${
                                alreadyOwned
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              {alreadyOwned ? "Already Claimed" : "Claim NFT"}
                            </TransactionButton>
                            {!alreadyOwned && (
                              <button
                                onClick={() => setIsSendModalOpen(true)}
                                className="mt-2 bg-black font-bold text-white px-4 py-2 rounded-xl w-full"
                              >
                                Send to Wallet
                              </button>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="col-span-2 text-center text-gray-500 text-lg">
                        There are no NFTs in this collection
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-col justify-center mb-20 max-w-screen-lg">
            {account && (
              <>
                <div className="relative">
                  <div className="w-full max-w-xl mx-auto mb-5">
                    <div className="text-2xl text-black font-bold">
                      Owned NFTs
                    </div>
                  </div>
                  <div className="max-w-xs mx-auto">
                    {isLoadingOwnedNFTs ? (
                      <div className="col-span-3 flex justify-center items-center py-12">
                        <span className="inline-block w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin"></span>
                      </div>
                    ) : ownedNFTs && ownedNFTs.length > 0 ? (
                      ownedNFTs.map((nft) => (
                        <div
                          key={nft.id}
                          className="relative bg-white border rounded-2xl shadow-md p-7 flex flex-col items-center hover:scale-[1.03] hover:shadow-lg transition-all duration-300 group"
                        >
                          <div className="absolute top-4 right-4">
                            <span className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                              Owned
                            </span>
                          </div>
                          <div className="w-44 h-44 mb-5 flex items-center justify-center rounded-xl overflow-hidden border-2 border-gray transition-all">
                            <MediaRenderer
                              client={client}
                              src={nft.metadata.image}
                            />
                          </div>
                          <h3 className="text-xl font-bold mb-2 text-gray-800 text-center">
                            {nft.metadata.name}
                          </h3>
                          <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                            Token ID: {nft.id.toString()}
                          </p>
                          <div className=" bg-black p-4 border rounded-lg shadow-md w-full">
                            {nft.metadata.attributes &&
                            nft.metadata.attributes.length > 0 ? (
                              <ul className="space-y-2">
                                {nft.metadata.attributes.map((attr, index) => (
                                  <li key={index} className="text-white">
                                    <span className="font-semibold">
                                      {attr.trait_type}:
                                    </span>{" "}
                                    {attr.value}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <></>
                            )}
                          </div>
                          <span className="absolute bottom-4 right-4 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                            x{nft.quantityOwned.toString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="col-span-3 text-center text-gray-500 text-lg">
                        No owned NFTs
                      </p>
                    )}
                  </div>
                </div>
              </>
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
