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

```javascript
// Javascript:
const BlockByDate = require("eth-block-by-date")
const { ethers } = require('ethers');

const provider = new ethers.providers.InfuraProvider();

const blockByDate = new BlockByDate(
    provider // required
);
```

```typescript
// Typescript:
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
const block = await blockByDate.getDate(
    '2023-01-20T13:20:40Z', // Date, required. Any valid dayjs value: string, Date() object, dayjs() object.
    true, // Block after, optional. Search for the nearest block before or after the given date. By default true.
    false // Refresh boundaries, optional. Recheck the latest block before request. By default false.
);

/* Returns: {
    date // searched date
    block // found block number
    timestamp // found block timestamp
} */

const requests = blockByDate.requests;

/* Returns count of made requests */
```

```typescript
// Getting 2 blocks by given dates:
const blocks = await blockByDate.getFirstBlocksByPeriod(
    '2023-01-01T08:00:00.000Z', // Date, required. Any valid dayjs value: string, Date() object, dayjs() object.
    '2023-02-01T08:00:00.000Z', // Date, required. Any valid dayjs value: string, Date() object, dayjs() object.
    false // Refresh boundaries, optional. Recheck the latest block before request. By default false.
);

/* Returns: Array<{
    date // searched date
    block // found block number
    timestamp // found block timestamp
}> */
```

Note: if the given date is before the first block date in the blockchain, the script will return 1 as block number. If the given date is in the future, the script will return the last block number in the blockchain.

## Dayjs

The package uses [dayjs](https://day.js.org/) plugin to parse date.