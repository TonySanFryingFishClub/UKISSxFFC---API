import { ethers } from 'ethers';
import ContractABI from '../contracts/ABI.json' assert { type: 'json' };
import CONFIG from '../config/index.js';
import APIError from './apiError.js';
import { StatusCodes } from 'http-status-codes';

const CONTRACT_ADDRESS = CONFIG.OTHERS.CONTRACT_ADDRESS;
const ALCHEMY_ID = CONFIG.OTHERS.ALCHEMY_ID;
const WALLET_KEY = CONFIG.OTHERS.WALLET_KEY;

const provider = new ethers.providers.AlchemyProvider('goerli', ALCHEMY_ID);
const signer = new ethers.Wallet(WALLET_KEY, provider);
const NFTContract = new ethers.Contract(CONTRACT_ADDRESS, ContractABI, signer);

export const handleMint = async ({ address, tier, amount }) => {
  try {
    const gas = await NFTContract.estimateGas.mint_for_User(address, amount, tier);
    const tx = await NFTContract.mint_for_User(address, amount, tier, {
      gasLimit: gas,
    });
    const receipt = await tx.wait();
    console.log('🚀 ~ file: handleMint.js:20 ~ handleMint ~ receipt:', receipt);
    console.log('🚀 ~ file: index.js:21 ~ handleMint ~ tx: NFT Minted Successfully');
  } catch (error) {
    console.log("🚀 ~ file: handleMint.js:25 ~ handleMint ~ error:", error.reason)
    throw new APIError(error.message, StatusCodes.BAD_REQUEST);
  }
};
