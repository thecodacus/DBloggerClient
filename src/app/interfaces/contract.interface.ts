import { string } from 'prop-types';
import { AbiItem } from 'web3-utils';

export interface IContractJson {
  [key: string]: any;
  contractName: string;
  abi: AbiItem[];
  networks: {
    [x: number]: {
      events: any;
      links: any;
      address: string;
      transactionHash: string;
    };
  };
  schemaVersion: string;
  updatedAt: Date;
  networkType: string;
}
