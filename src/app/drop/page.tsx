"use client";

import thirdwebIcon from "@public/thirdweb.svg";
import Image from "next/image";
import { useState, useEffect } from "react";

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
  const [isExistingModalOpen, setIsExistingModalOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const {
    data: ownedNFTs,
    refetch: refetchOwnedNFTs,
    isLoading: isLoadingOwnedNFTs,
  } = useReadContract(getOwnedNFTs, {
    contract: contract,
    address: account?.address || "",
  });

  useEffect(() => {
    if (ownedNFTs && ownedNFTs.length > 0) {
      for (var i = 0; i < ownedNFTs.length; i++) {
        const nft = ownedNFTs[i];
        if (nft.id == 0n) {
          //console.log("User owns the NFT with ID 0");
          setGateOpen(true);
        }
      }
    }
  }, [ownedNFTs]);

  useEffect(() => {
    async function checkSignup() {
      const result = await fetch("/api/getRegistrationStatus", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          address: account?.address,
          tokenId: process.env.NEXT_PUBLIC_TOKEN_ID!,
        }),
      });

      result.json().then((data) => {
        if (data["data"].length > 0) {
          setIsRegistered(true);
        }
      });
    }

    if (account) {
      checkSignup();
    }
  }, [account]);

  async function saveSignup(address: string, tokenId?: bigint) {
    const result = await fetch("/api/getRegistrationStatus", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        address,
        tokenId: tokenId ? Number(tokenId) : undefined,
      }),
    });

    result.json().then((data) => {
      if (data["data"].length == 0) {
        fetch("/api/register", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            address,
            tokenId: tokenId ? Number(tokenId) : undefined,
          }),
        });
      } else {
        alert("You have already registered for the airdrop!");
      }
    });
  }

  return (
    <>
      <div className="">
        <nav className="bg-black border-b border-gray-200 shadow-sm py-0">
          <div className="container mx-auto px-4 py-1 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="text-white text-2xl font-semibold">
                Drop Page
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
                  Welcome! Login below to register for the airdrop.
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
                    <div className="text-2xl text-black font-bold text-center">
                      Airdrop Registration
                    </div>
                  </div>
                  <div className="mx-auto grid gap-6 grid-cols-[repeat(auto-fit,minmax(280px,1fr))] justify-items-center max-w-6xl">
                    {isLoadingOwnedNFTs ? (
                      <div className="col-span-2 flex justify-center items-center py-12">
                        <span className="inline-block w-12 h-12 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></span>
                      </div>
                    ) : gateOpen ? (
                      isRegistered ? (
                        <div className="col-span-3 text-center p-10 bg-green-100 border border-green-300 rounded-xl">
                          <h2 className="text-2xl font-bold mb-4 text-green-800">
                            You are already registered for the airdrop!
                          </h2>
                          <p className="text-green-700">
                            Sit back and relax, the airdrop will be send to your
                            wallet
                          </p>
                        </div>
                      ) : (
                        <div className="col-span-3 text-center p-10 bg-green-100 border border-green-300 rounded-xl">
                          <h2 className="text-2xl font-bold mb-4 text-green-800">
                            You have the required NFT for the airdrop!
                          </h2>
                          <p className="text-green-700">
                            Click below to register for the airdrop.
                          </p>
                          <button
                            onClick={() => saveSignup(account.address, 1n)}
                            className="mt-2 bg-blue-500 font-bold text-white px-4 py-2 rounded-xl w-full"
                          >
                            Register
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="col-span-3 text-center p-10 bg-red-100 border border-red-300 rounded-xl">
                        <h2 className="text-2xl font-bold mb-4 text-red-800">
                          You do not own the required NFT to register for the
                          airdrop.
                        </h2>
                        <p className="text-red-700">
                          We will have more claim dates opening soon. Please
                          check back later!
                        </p>
                      </div>
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
