# Get Ethereum Block Info By Date

Get Ethereum block info by a given date.

Works with any Ethereum based networks.

Works with [ethers.js](https://docs.ethers.io/)

## Installation

Use npm:

```
npm i eth-block-by-date
```

Or yarn:

```
yarn add eth-block-by-date
```

## Usage

### With Ethers.js

```javascript
const BlockByDate = require("eth-block-by-date")
const { ethers } = require('ethers');

const provider = new ethers.providers.InfuraProvider();

const blockByDate = new BlockByDate(
    provider // required
);
```

```typescript
import BlockByDate from "eth-block-by-date"
import { ethers } from 'ethers';

const provider = new ethers.providers.InfuraProvider();

const blockByDate = new BlockByDate(
    provider // required
);
```

### Requests

```typescript
// Getting block by date:
let block = await blockByDate.getDate(
    '2016-07-20T13:20:40Z', // Date, required. Any valid dayjs value: string, Date() object, dayjs() object.
    true, // Block after, optional. Search for the nearest block before or after the given date. By default true.
    false // Refresh boundaries, optional. Recheck the latest block before request. By default false.
);

/* Returns: {
    date // searched date
    block // found block number
    timestamp // found block timestamp
} */

let requests = blockByDate.requests;

/* Returns count of made requests */
```

Note: if the given date is before the first block date in the blockchain, the script will return 1 as block number. If the given date is in the future, the script will return the last block number in the blockchain.

## Dayjs

The package uses dayjs plugin to parse date.