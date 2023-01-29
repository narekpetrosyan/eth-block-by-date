import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import utc from 'dayjs/plugin/utc';
import { providers as EthersProviders } from 'ethers';

dayjs.extend(utc);
dayjs.extend(isSameOrAfter);

interface BlockResult {
  block: number;
  timestamp: number;
  date: string;
}

interface IBlock {
  timestamp: number;
  number: number;
}

export default class {
  provider: EthersProviders.Provider;
  checkedBlocks: Record<number | string, number[]>;
  savedBlocks: Record<number | string, IBlock>;
  latestBlock!: IBlock;
  firstBlock!: IBlock;
  blockTime!: number;
  requests: number;

  constructor(_provider: EthersProviders.Provider) {
    this.provider = _provider;
    this.checkedBlocks = {};
    this.savedBlocks = {};
    this.requests = 0;
  }

  private async getBoundaries(): Promise<void> {
    this.latestBlock = await this.getBlockWrapper('latest');
    this.firstBlock = await this.getBlockWrapper(1);
    this.blockTime =
      (parseInt(String(this.latestBlock.timestamp), 10) - parseInt(String(this.firstBlock.timestamp), 10)) /
      (parseInt(String(this.latestBlock.number), 10) - 1);
  }

  async getDate(date: string | Dayjs | Date, after = true, refresh = false): Promise<BlockResult> {
    const utcDate = !dayjs.isDayjs(date) ? dayjs(date).utc() : date;

    if (
      typeof this.firstBlock === 'undefined' ||
      typeof this.latestBlock === 'undefined' ||
      typeof this.blockTime === 'undefined' ||
      refresh
    )
      await this.getBoundaries();
    if (utcDate.isBefore(dayjs.unix(this.firstBlock.timestamp))) return this.returnWrapper(utcDate.format(), 1);
    if (utcDate.isSameOrAfter(dayjs.unix(this.latestBlock.timestamp)))
      return this.returnWrapper(utcDate.format(), this.latestBlock.number);
    this.checkedBlocks[utcDate.unix()] = [];
    const predictedBlock = await this.getBlockWrapper(
      Math.ceil(utcDate.diff(dayjs.unix(this.firstBlock.timestamp), 'seconds') / this.blockTime),
    );
    return this.returnWrapper(utcDate.format(), await this.findBetter(utcDate, predictedBlock, after));
  }

  private async findBetter(
    date: Dayjs,
    predictedBlock: IBlock,
    after: boolean,
    blockTime = this.blockTime,
  ): Promise<number> {
    if (await this.isBetterBlock(date, predictedBlock, after)) return predictedBlock.number;
    const difference = date.diff(dayjs.unix(predictedBlock.timestamp), 'seconds');
    let skip = Math.ceil(difference / (blockTime === 0 ? 1 : blockTime));
    if (skip === 0) skip = difference < 0 ? -1 : 1;
    const nextPredictedBlock = await this.getBlockWrapper(this.getNextBlock(date, predictedBlock.number, skip));
    blockTime = Math.abs(
      (parseInt(String(predictedBlock.timestamp), 10) - parseInt(String(nextPredictedBlock.timestamp), 10)) /
        (parseInt(String(predictedBlock.number), 10) - parseInt(String(nextPredictedBlock.number), 10)),
    );
    return this.findBetter(date, nextPredictedBlock, after, blockTime);
  }

  private async isBetterBlock(date: Dayjs, predictedBlock: IBlock, after: boolean) {
    const blockTime = dayjs.unix(predictedBlock.timestamp);
    if (after) {
      if (blockTime.isBefore(date)) return false;
      const previousBlock = await this.getBlockWrapper(predictedBlock.number - 1);
      if (blockTime.isSameOrAfter(date) && dayjs.unix(previousBlock.timestamp).isBefore(date)) return true;
    } else {
      if (blockTime.isSameOrAfter(date)) return false;
      const nextBlock = await this.getBlockWrapper(predictedBlock.number + 1);
      if (blockTime.isBefore(date) && dayjs.unix(nextBlock.timestamp).isSameOrAfter(date)) return true;
    }
    return false;
  }

  private getNextBlock(date: Dayjs, currentBlock: number, skip: number): number {
    let nextBlock = currentBlock + skip;
    if (nextBlock > this.latestBlock.number) nextBlock = this.latestBlock.number;
    if (this.checkedBlocks[date.unix()].includes(nextBlock))
      return this.getNextBlock(date, currentBlock, skip < 0 ? --skip : ++skip);
    this.checkedBlocks[date.unix()].push(nextBlock);
    return nextBlock < 1 ? 1 : nextBlock;
  }

  private returnWrapper(date: string, block: number): BlockResult {
    return {
      date: dayjs(date).utc().toString(),
      block,
      timestamp: this.savedBlocks[block].timestamp,
    };
  }

  private async getBlockWrapper(block: number | string): Promise<IBlock> {
    if (this.savedBlocks[block]) return this.savedBlocks[block];
    const { number: num, timestamp } = await this.provider.getBlock(block);
    this.savedBlocks[num] = {
      timestamp,
      number: num,
    };
    this.requests++;
    return this.savedBlocks[num];
  }
}
