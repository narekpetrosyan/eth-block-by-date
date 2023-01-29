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
  private provider: EthersProviders.Provider;
  private blocksChecked: Record<number | string, number[]>;
  private blocksSaved: Record<number | string, IBlock>;
  private lastBlock!: IBlock;
  private firstBlock!: IBlock;
  private blockTimestamp!: number;
  requests: number;

  constructor(_provider: EthersProviders.Provider) {
    this.provider = _provider;
    this.blocksChecked = {};
    this.blocksSaved = {};
    this.requests = 0;
  }

  private async requestBounderies(): Promise<void> {
    this.lastBlock = await this.getBlockWrapper('latest');
    this.firstBlock = await this.getBlockWrapper(1);
    this.blockTimestamp =
      (parseInt(String(this.lastBlock.timestamp), 10) - parseInt(String(this.firstBlock.timestamp), 10)) /
      (parseInt(String(this.lastBlock.number), 10) - 1);
  }

  async getBlockByDate(date: string | Dayjs | Date, after = true, refresh = false): Promise<BlockResult> {
    const utcDate = !dayjs.isDayjs(date) ? dayjs(date).utc() : date;

    if (this.firstBlock === undefined || this.lastBlock === undefined || this.blockTimestamp === undefined || refresh)
      await this.requestBounderies();
    if (utcDate.isBefore(dayjs.unix(this.firstBlock.timestamp))) return this.wrapReturn(utcDate.format(), 1);
    if (utcDate.isSameOrAfter(dayjs.unix(this.lastBlock.timestamp)))
      return this.wrapReturn(utcDate.format(), this.lastBlock.number);
    this.blocksChecked[utcDate.unix()] = [];
    const predictedBlock = await this.getBlockWrapper(
      Math.ceil(utcDate.diff(dayjs.unix(this.firstBlock.timestamp), 'seconds') / this.blockTimestamp),
    );
    return this.wrapReturn(utcDate.format(), await this.findBetter(utcDate, predictedBlock, after));
  }

  private async findBetter(
    date: Dayjs,
    predictedBlock: IBlock,
    after: boolean,
    blockTime = this.blockTimestamp,
  ): Promise<number> {
    const isBlockBetter = await this.checkBlock(date, predictedBlock, after);
    if (isBlockBetter) return predictedBlock.number;
    const difference = date.diff(dayjs.unix(predictedBlock.timestamp), 'seconds');
    let skip = Math.ceil(difference / (blockTime === 0 ? 1 : blockTime));
    if (skip === 0) skip = difference < 0 ? -1 : 1;
    const nextPredictedBlock = await this.getBlockWrapper(this.requestNextBlock(date, predictedBlock.number, skip));
    blockTime = Math.abs(
      (parseInt(String(predictedBlock.timestamp), 10) - parseInt(String(nextPredictedBlock.timestamp), 10)) /
        (parseInt(String(predictedBlock.number), 10) - parseInt(String(nextPredictedBlock.number), 10)),
    );
    return this.findBetter(date, nextPredictedBlock, after, blockTime);
  }

  private async checkBlock(date: Dayjs, predictedBlock: IBlock, after: boolean) {
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

  private requestNextBlock(date: Dayjs, currentBlock: number, skip: number): number {
    let nextBlock = currentBlock + skip;
    if (nextBlock > this.lastBlock.number) nextBlock = this.lastBlock.number;
    if (this.blocksChecked[date.unix()].includes(nextBlock))
      return this.requestNextBlock(date, currentBlock, skip < 0 ? --skip : ++skip);
    this.blocksChecked[date.unix()].push(nextBlock);
    return nextBlock < 1 ? 1 : nextBlock;
  }

  private wrapReturn(date: string, block: number): BlockResult {
    return {
      date: dayjs(date).utc().toString(),
      block,
      timestamp: this.blocksSaved[block].timestamp,
    };
  }

  private async getBlockWrapper(block: number | string): Promise<IBlock> {
    if (this.blocksSaved[block]) return this.blocksSaved[block];
    const { number: num, timestamp } = await this.provider.getBlock(block);
    this.blocksSaved[num] = {
      timestamp,
      number: num,
    };
    this.requests++;
    return this.blocksSaved[num];
  }
}
