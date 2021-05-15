import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import Web3 from 'web3';
import { SwarmClient } from '@erebos/swarm-browser';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import ethProvider from 'eth-provider';
import { IBlogPost } from '../interfaces/blog.interface';
@Injectable({
  providedIn: 'root',
})
export class ContractService {
  private web3: Web3;
  private provider: any;
  private connected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  private wallet: Subject<string[]> = new Subject();
  private swarm: SwarmClient;
  private web3Modal: Web3Modal;
  constructor() {
    this.web3 = new Web3();
    this.web3Modal = new Web3Modal({
      network: 'mainnet', // optional
      cacheProvider: false, // optional
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider, // required
          options: {
            infuraId: '96405d2e074541f0854cbb2d17783bf8', // required
          },
        },
        frame: {
          package: ethProvider, // required
        },
      }, // required
      theme: {
        background: 'rgb(39, 49, 56)',
        main: 'rgb(199, 199, 199)',
        secondary: 'rgb(136, 136, 136)',
        border: 'rgba(195, 195, 195, 0.14)',
        hover: 'rgb(16, 26, 32)',
      },
    });
    this.connect()
      .then((x) => {
        console.log(x);
        return this.web3.eth.getAccounts();
      })
      .then((x) => {
        console.log(x);
      });
  }
  isConnected() {
    this.connected.asObservable();
  }
  getConnectedWallets() {
    this.wallet.asObservable();
  }
  async connect() {
    this.provider = await this.web3Modal.connect();
    if (this.provider == undefined) {
      this.connected.next(false);
      return { success: false, msg: 'No Provider' };
    }
    this.web3.setProvider(this.provider);
    // this.web3.eth.getAccounts().then(console.log);
    try {
      let vals = await this.web3.eth.requestAccounts();
      this.wallet.next(vals);
      return { success: true };
    } catch (err) {
      return { success: false, msg: err.message };
    }
  }
  disconnect() {
    this.provider = null;
    this.connected.next(false);
    this.wallet.next(null);
  }
  connectBzz() {
    this.swarm = new SwarmClient({
      bzz: { url: 'https://swarm-gateways.net' },
    });
    this.web3.bzz.setProvider('https://swarm-gateways.net');
    this.web3.bzz.upload('');
  }
  async storeData(data: string): Promise<string> {
    return await this.swarm.bzz.uploadData(data);
  }
  async getData(data: string): Promise<string> {
    return await this.swarm.bzz.downloadData(data);
  }

  async writePost(data: any) {}

  async getPost(hash: string): Promise<IBlogPost> {
    return null;
  }
  async getPostsByAuthor(author: string) {}
  async getAllPosts(hash: string) {}
}
