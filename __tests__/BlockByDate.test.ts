import BlockByDate from '../src';
import dayjs from 'dayjs';
import { ethers } from 'ethers';

const provider = new ethers.providers.InfuraProvider();
const blockByDate = new BlockByDate(provider);

describe('Block By Date Ethers Tests', () => {
  jest.setTimeout(15000);

  beforeEach((done) => {
    done();
  });

  it('Should get right block for a given string', async () => {
    let block = await blockByDate.getBlockByDate('2016-07-20T13:20:40Z');
    expect(block.block).toEqual(1920000);
  });

  it('Should return 1 as block number if given time is before first block time', async function () {
    let block = await blockByDate.getBlockByDate(new Date('1961-04-06:07:00Z'));
    expect(block.block).toEqual(1);
  });

  it('Should return last block number if given time is in the future', async function () {
    let last = await provider.getBlockNumber();
    let block = await blockByDate.getBlockByDate(dayjs().add(100, 'years'), true, true);
    expect(block.block).toEqual(last);
  });

  it('Should make less then 15 requests for 2015-09-03T08:47:03.168Z', async function () {
    blockByDate.requests = 0;
    await blockByDate.getBlockByDate('2015-09-03T08:47:03.168Z');
    expect(blockByDate.requests).toBeLessThan(15);
  });

  it('Should make less then 15 requests for 2017-09-09T16:33:13.236Z', async function () {
    blockByDate.requests = 0;
    await blockByDate.getBlockByDate('2017-09-09T16:33:13.236Z');
    expect(blockByDate.requests).toBeLessThan(15);
  });

  it('Should make less then 15 requests for 2017-09-22T13:52:59.961Z', async function () {
    blockByDate.requests = 0;
    await blockByDate.getBlockByDate('2017-09-22T13:52:59.961Z');
    expect(blockByDate.requests).toBeLessThan(15);
  });

  it('Should make less then 16 requests for 2016-11-14T14:46:06.107Z', async function () {
    blockByDate.requests = 0;
    await blockByDate.getBlockByDate('2016-11-14T14:46:06.107Z');
    expect(blockByDate.requests).toBeLessThan(16);
  });

  it('Should make less then 15 requests for 2017-04-20T07:54:29.965Z', async function () {
    blockByDate.requests = 0;
    await blockByDate.getBlockByDate('2017-04-20T07:54:29.965Z');
    expect(blockByDate.requests).toBeLessThan(15);
  });

  it('Should return right timestamp for a given date', async function () {
    let block = await blockByDate.getBlockByDate(dayjs('2015-07-30T11:28:01-04:00'));
    expect(block.block).toEqual(5);
  });

  it('Should return right timestamp for a given date', async function () {
    let block = await blockByDate.getBlockByDate(dayjs('2015-07-30T11:28:02-04:00'));
    expect(block.block).toEqual(5);
  });

  it('Should return right timestamp for a given date', async function () {
    let block = await blockByDate.getBlockByDate(dayjs('2015-07-30T11:28:03-04:00'));
    expect(block.block).toEqual(5);
  });
});
