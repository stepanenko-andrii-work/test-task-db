import { Controller, Get, Query } from '@nestjs/common';
import { DataService } from './data.service';
import { IFinalRewardData, IQueryParams } from './data.interfaces';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Get('import')
  async importDataToDb(): Promise<string> {
    const response: string = await this.dataService.importDataToDb();

    return response;
  }

  @Get('rewards')
  async getRewardsData(
    @Query() queryParams: IQueryParams,
  ): Promise<IFinalRewardData[]> {
    const rewardsData: IFinalRewardData[] =
      await this.dataService.getRewardsData(queryParams);

    return rewardsData;
  }
}
