import WalletConnectProvider from '@walletconnect/web3-provider';
import { isEqual } from 'lodash';
// import BigNumber from 'bignumber.js';
// import * as BigNumber from 'bignumber.js';
import Web3 from 'web3';

import config from '../config';

export default class Web3Provider {
  public provider: any;

  public web3Provider: any;

  public allowanceTarget: string;

  public addresses: any;

  constructor() {
    this.provider = new WalletConnectProvider({
      infuraId: config.keys.infura,
    });
    this.web3Provider = new Web3(this.provider);
    this.addresses = config.addresses;
    this.allowanceTarget = this.addresses[config.netType].allowanceTarget;

    this.provider.on('accountsChanged', (accounts: string[]) => {
      const fromStorage = localStorage.getItem('accountsWalletConnect') || '{}';
      console.log('Web3Provider accountsChanged:', accounts, JSON.parse(fromStorage).accounts);
      if (!accounts || !isEqual(JSON.parse(fromStorage).accounts, accounts)) {
        localStorage.setItem('accountsWalletConnect', JSON.stringify({ accounts }));
        window.location.reload();
      }
    });

    this.provider.on('chainChanged', (chainId: number) => {
      const fromStorage = localStorage.getItem('chainIdWalletConnect') || '{}';
      console.log('Web3Provider chainChanged:', chainId, JSON.parse(fromStorage).chainId);
      if (!chainId || !isEqual(JSON.parse(fromStorage).chainId, chainId)) {
        localStorage.setItem('chainIdWalletConnect', JSON.stringify({ chainId }));
        window.location.reload();
      }
    });

    this.provider.on('disconnect', (code: number, reason: string) => {
      console.log('Web3Provider disconnect:', code, reason);
    });
  }

  public checkNetwork = async () => {
    const { chainIds } = config;
    const chainIdsByType = chainIds[config.IS_PRODUCTION ? 'mainnet' : 'testnet'];
    const usedNet = chainIdsByType.Ethereum.id;
    const netVersion =
      (await this.provider.request({ method: 'eth_chainId' })) || this.provider.chainId;
    const neededNetName = chainIdsByType.Ethereum.name;
    console.log('Web3Provider checkNetwork:', usedNet, netVersion, neededNetName);
    if (usedNet.includes(netVersion)) return { status: 'SUCCESS', data: netVersion };
    return {
      status: 'ERROR',
      message: `Please, change network to ${neededNetName} in your WalletConnect wallet. Current chainId: ${netVersion}`,
    };
  };

  public connect = async () => {
    console.log('Web3Provider connect:', this.provider);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line no-param-reassign
    window.provider = this.provider;
    return new Promise<any>((resolve, reject) => {
      this.provider
        .enable()
        .then((res: any) => {
          resolve(res);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  };

  public disconnect = () => {
    this.provider.disconnect();
  };

  public getBalance = async (address: string) => {
    const balance = await this.web3Provider.eth.getBalance(address);
    // return +new BigNumber(balance).dividedBy(new BigNumber(10).pow(18)).toFixed()
    return +balance / 10e17;
  };

  public sendTx = async (data: any) => {
    return this.web3Provider.eth.sendTransaction(data);
  };

  public balanceOf = async ({ address, contractAddress, contractAbi }: any) => {
    const contract = new this.web3Provider.eth.Contract(contractAbi, contractAddress);
    const balance = await contract.methods.balanceOf(address).call();
    return +balance / 10e17;
  };

  public approve = async ({ data, contractAbi }: any) => {
    try {
      // const { from, allowanceTarget, sellAmount, sellTokenAddress } = data;
      const { from, sellAmount, sellTokenAddress } = data;
      // console.log('Web3Provider approve data:', data);
      const contractAddress = sellTokenAddress;
      // console.log('Web3Provider approve contractAbi:', contractAbi);
      const contract = new this.web3Provider.eth.Contract(contractAbi, contractAddress);
      return contract.methods.approve(this.allowanceTarget, sellAmount).send({ from });
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  public getGasPrice = async () => {
    const price = await this.web3Provider.eth.getGasPrice();
    // return +new BigNumber(balance).dividedBy(new BigNumber(10).pow(18)).toFixed()
    return +price / 10e8;
  };
}
