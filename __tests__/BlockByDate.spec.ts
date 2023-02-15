import { BlockByDate } from '../src';
import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import { ethers } from 'ethers';

const provider = new ethers.providers.InfuraProvider();
const blockByDate = new BlockByDate(provider);

describe('Block By Date Ethers Tests', () => {
  it('Should get right block for a given string', async () => {
    let block = await blockByDate.getBlockByDate('2023-01-01T08:00:00.000Z');
    expect(block.block).toEqual(16310583);
  });

  it('Should return 1 as block number if given date is before first block date', async () => {
    let block = await blockByDate.getBlockByDate(new Date('1961-04-06:07:00Z'));
    expect(block.block).toEqual(1);
  });

  it('Should return last block number if given date is in the future', async () => {
    let last = await provider.getBlockNumber();
    let block = await blockByDate.getBlockByDate(dayjs().add(100, 'years'), true, true);
    expect(block.block).toEqual(last);
  });

  it('Should make less then 15 requests for 2021-01-01T00:00:03.168Z', async () => {
    blockByDate.requests = 0;
    await blockByDate.getBlockByDate('2021-01-01T00:00:03.168Z');
    expect(blockByDate.requests).toBeLessThan(15);
  });

  it('Should make less then 15 requests for 2021-09-09T16:33:13.236Z', async () => {
    blockByDate.requests = 0;
    await blockByDate.getBlockByDate('2021-09-09T16:33:13.236Z');
    expect(blockByDate.requests).toBeLessThan(15);
  });

  it('Should make less then 15 requests for 2022-01-01T00:00:59.961Z', async () => {
    blockByDate.requests = 0;
    await blockByDate.getBlockByDate('2022-01-01T00:00:59.961Z');
    expect(blockByDate.requests).toBeLessThan(15);
  });

  it('Should make less then 15 requests for 2022-09-01T00:00:06.107Z', async () => {
    blockByDate.requests = 0;
    await blockByDate.getBlockByDate('2022-09-01T00:00:06.107Z');
    expect(blockByDate.requests).toBeLessThan(15);
  });

  it('Should make less then 10 requests for 2023-01-01T00:00:29.965Z', async () => {
    blockByDate.requests = 0;
    await blockByDate.getBlockByDate('2023-01-01T00:00:29.965Z');
    expect(blockByDate.requests).toBeLessThan(10);
  });

  it('Should return right timestamp for 2022-01-01T18:31:29.965Z', async () => {
    let block = await blockByDate.getBlockByDate(dayjs('2022-01-01T18:31:29.965Z'));
    expect(block.timestamp).toEqual(1641061893);
  });

  it('Should return right timestamp for 2023-01-01T23:45:29.965Z', async () => {
    let block = await blockByDate.getBlockByDate(dayjs('2023-01-01T23:45:29.965Z'));
    expect(block.timestamp).toEqual(1672616735);
  });

  it('Should get first blocks of the months', async () => {
    let expectedBlocks = await blockByDate.getFirstBlocksByPeriod(
      '2023-01-01T08:00:00.000Z',
      '2023-02-01T08:00:00.000Z',
    );

    let blockNumbers = expectedBlocks.map((block) => block.block);
    let expected = [16310583, 16532636];
    expect(expected).toStrictEqual(blockNumbers);
  });
});
