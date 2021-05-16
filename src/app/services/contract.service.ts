import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import Web3 from 'web3';
import { SwarmClient } from '@erebos/swarm-browser';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import ethProvider from 'eth-provider';
import { Contract } from 'web3-eth-contract';
import { HttpClient } from '@angular/common/http';

import { IBlogPost } from '../interfaces/blog.interface';
import { IContractJson } from '../interfaces/contract.interface';
import { IUser } from '../interfaces/author.interface';

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
  private contract: Contract;
  private selectedAddress: string = null;
  private selectedAddress$ = new BehaviorSubject<string>(null);

  constructor(private httpClient: HttpClient) {
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
        let vals = this.web3.eth.getAccounts();
        return vals;
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
      let addresses = await this.web3.eth.requestAccounts();
      this.selectedAddress = addresses[0];
      this.wallet.next(addresses);
    } catch (err) {
      return { success: false, msg: err.message };
    }
    try {
      let contractJson = await this.httpClient
        .get<IContractJson>('assets/contracts/DBlogger.json')
        .toPromise();
      let networkID = await this.web3.eth.net.getId();

      this.contract = new this.web3.eth.Contract(
        contractJson.abi,
        contractJson.networks[networkID].address
      );
      this.connected.next(true);
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
  }
  getSelectedAddress() {
    return this.selectedAddress$.asObservable();
  }
  async setSelectedAddress(addressId: number) {
    let address = (await this.web3.eth.getAccounts())[addressId];
    this.selectedAddress = address;
    this.selectedAddress$.next(this.selectedAddress);
  }

  // Contract Wrapper Functions//
  // all read Functions//
  async getUserProfile(hash: string): Promise<IUser> {
    let user: IUser = await this.contract.methods
      .getUser(hash)
      .call({ from: this.selectedAddress })
      .catch((err) => {
        let error = JSON.parse(
          err.message.replace('Internal JSON-RPC error.', '')
        );
        console.log(error);
        return null;
      });
    if (user == undefined) return user;
    try {
      user.profile = JSON.parse(await this.getData(user.profile_hash));
    } catch (err) {
      console.log(err);
    }
    return user;
  }
  async getMyProfile(): Promise<IUser> {
    return await this.getUserProfile(this.selectedAddress);
  }
  async getAllUserProfile(): Promise<IUser[]> {
    let users: IUser[] = await this.contract.methods
      .getAllUser()
      .call({ from: this.selectedAddress })
      .catch((err) => {
        let error = JSON.parse(
          err.message.replace('Internal JSON-RPC error.', '')
        );
        console.log(error);
        return null;
      });

    if (users == undefined) return [];
    users = await Promise.all(
      users.map(async (user) => {
        try {
          user.profile = JSON.parse(await this.getData(user.profile_hash));
        } catch (err) {
          console.log(err);
        }
        return user;
      })
    );
    return users;
  }
  async getAllAuthorProfile(): Promise<IUser[]> {
    let authors: IUser[] = await this.contract.methods
      .getAllPostAuthor()
      .call({ from: this.selectedAddress })
      .catch((err) => {
        let error = JSON.parse(
          err.message.replace('Internal JSON-RPC error.', '')
        );
        console.log(error);
        return null;
      });
    if (authors == undefined) return [];
    authors = await Promise.all(
      authors.map(async (author) => {
        try {
          author.profile = JSON.parse(await this.getData(author.profile_hash));
        } catch (err) {
          console.log(err);
        }
        return author;
      })
    );
    return authors;
  }
  async getPost(hash: string): Promise<IBlogPost> {
    let post: IBlogPost = await this.contract.methods
      .getPost(hash)
      .call({ from: this.selectedAddress })
      .catch((err) => {
        let error = JSON.parse(
          err.message.replace('Internal JSON-RPC error.', '')
        );
        console.log(error);
        return null;
      });
    if (post == undefined) return post;
    try {
      post.content = JSON.parse(await this.getData(post.content_hash));
    } catch (err) {
      console.log(err);
    }
    return post;
  }
  async getAllPosts(): Promise<IBlogPost[]> {
    let posts: IBlogPost[] = await this.contract.methods
      .getAllPost()
      .call({ from: this.selectedAddress })
      .catch((err) => {
        let error = JSON.parse(
          err.message.replace('Internal JSON-RPC error.', '')
        );
        console.log(error);
        return null;
      });
    if (posts == undefined) return posts;
    posts = await Promise.all(
      posts.map(async (post) => {
        try {
          post.content = JSON.parse(await this.getData(post.content_hash));
        } catch (err) {
          console.log(err);
        }
        return post;
      })
    );
    return posts;
  }
  async getRoleName(roleId): Promise<string> {
    return await this.contract.methods
      .getRoleName(roleId)
      .call({ from: this.selectedAddress })
      .catch((err) => {
        let error = JSON.parse(
          err.message.replace('Internal JSON-RPC error.', '')
        );
        console.log(error);
        return null;
      });
  }
  // all insert Functions//
  async addPost(post: IBlogPost) {
    let content_hash = await this.storeData(JSON.stringify(post));
    return await this.contract.methods
      .addPost(content_hash)
      .send({ from: this.selectedAddress })
      .catch((err) => {
        let error = JSON.parse(
          err.message.replace('Internal JSON-RPC error.', '')
        );
        console.log(error);
        return null;
      });
  }
  async registerUser(user: IUser) {
    let profile_hash = await this.storeData(JSON.stringify(user));
    return await this.contract.methods
      .registerUser(user.name, profile_hash)
      .send({ from: this.selectedAddress })
      .catch((err) => {
        let error = JSON.parse(
          err.message.replace('Internal JSON-RPC error.', '')
        );
        console.log(error);
        return null;
      });
  }
  // all update functions

  async editPost(post: IBlogPost) {
    let content_hash = await this.storeData(JSON.stringify(post));
    return await this.contract.methods
      .editPost(post.id, content_hash)
      .send({ from: this.selectedAddress })
      .catch((err) => {
        let error = JSON.parse(
          err.message.replace('Internal JSON-RPC error.', '')
        );
        console.log(error);
        return null;
      });
  }

  async editProfile(user: IUser) {
    let profile_hash = await this.storeData(JSON.stringify(user));
    return await this.contract.methods
      .editUser(user.name, profile_hash)
      .send({ from: this.selectedAddress })
      .catch((err) => {
        let error = JSON.parse(
          err.message.replace('Internal JSON-RPC error.', '')
        );
        console.log(error);
        return null;
      });
  }

  async editUserRole(userID: string, role: string) {
    return await this.contract.methods
      .editUserRole(userID, role)
      .send({ from: this.selectedAddress })
      .catch((err) => {
        let error = JSON.parse(
          err.message.replace('Internal JSON-RPC error.', '')
        );
        console.log(error);
        return null;
      });
  }

  // delete operations////
  async deletePost(postID: number) {
    return await this.contract.methods
      .deletePost(postID)
      .send({ from: this.selectedAddress })
      .catch((err) => {
        let error = JSON.parse(
          err.message.replace('Internal JSON-RPC error.', '')
        );
        console.log(error);
        return null;
      });
  }

  async deleteUser(userID: string) {
    return await this.contract.methods
      .deleteUser(userID)
      .send({ from: this.selectedAddress })
      .catch((err) => {
        let error = JSON.parse(
          err.message.replace('Internal JSON-RPC error.', '')
        );
        console.log(error);
        return null;
      });
  }

  // Swarm Wrapper Functions/

  async storeData(data: string): Promise<string> {
    return await this.swarm.bzz.uploadData(data);
  }
  async getData(data: string): Promise<string> {
    return await this.swarm.bzz.downloadData(data);
  }
  // general in Memory functions//
  async getPostsByAuthor(author: string) {}
}
