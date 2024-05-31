import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { PATH_TO_FILE } from '../utils/constants.util';
import {
  ICurrentDonation,
  ICurrentEmployee,
  ICurrentEmployeeSection,
  ICurrentRate,
  ICurrentSalaryStatement,
  IFinalRewardData,
  IGetFormattedDataFromTxtFileResponse,
  IQueryParams,
  IRawRewardData,
} from './data.interfaces';
import { EntityManager, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Rate } from '../entities/rate.entity';

@Injectable()
export class DataService {
  constructor(
    @InjectRepository(Rate)
    private readonly ratesRepository: Repository<Rate>,

    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async importDataToDb(): Promise<string> {
    try {
      const { employeesSplit, ratesSplit } = this.getFormattedDataFromTxtFile();

      let currentEmployee: ICurrentEmployee = null;
      let currentEmployeeSection: ICurrentEmployeeSection = null;
      let currentRate: ICurrentRate = null;

      // Employees

      for (const line of employeesSplit) {
        const trimmedLine: string = line.trim();

        switch (true) {
          case trimmedLine === 'Employee':
            if (currentEmployee) await this.upsertEmployeeData(currentEmployee);

            currentEmployee = {
              id: null,
              name: null,
              surname: null,
              department: { id: null, name: null },
              salary: [],
              donations: [],
            };
            currentEmployeeSection = currentEmployee;
            break;

          case trimmedLine.startsWith('id:'):
          case trimmedLine.startsWith('name:'):
          case trimmedLine.startsWith('surname:'):
          case trimmedLine.startsWith('amount:'):
          case trimmedLine.startsWith('date:'):
            const [key, value] = trimmedLine.split(':').map(s => s.trim());

            if (key === 'id' && !currentEmployee.id) {
              currentEmployee.id = +value;
            } else if (key === 'name' && !currentEmployee.name) {
              currentEmployee.name = value;
            } else if (key === 'surname' && !currentEmployee.surname) {
              currentEmployee.surname = value;
            } else if (currentEmployeeSection) {
              currentEmployeeSection[key] = value;
            }
            break;

          case trimmedLine === 'Department':
            currentEmployeeSection = currentEmployee.department;
            break;

          case trimmedLine === 'Donation':
            currentEmployeeSection = {
              id: null,
              amount: null,
              date: null,
            } as ICurrentDonation;
            currentEmployee.donations.push(currentEmployeeSection);
            break;

          case trimmedLine === 'Statement':
            currentEmployeeSection = {
              id: null,
              amount: null,
              date: null,
            } as ICurrentSalaryStatement;
            currentEmployee.salary.push(currentEmployeeSection);
            break;
        }
      }

      if (currentEmployee) await this.upsertEmployeeData(currentEmployee);

      // Rates

      for (const line of ratesSplit) {
        const trimmedLine: string = line.trim();

        if (trimmedLine === 'Rate') {
          if (currentRate) await this.upsertRateData(currentRate);

          currentRate = {
            date: null,
            sign: null,
            value: null,
          };
        } else if (currentRate && trimmedLine) {
          const [key, value] = trimmedLine.split(':').map(s => s.trim());
          currentRate[key] = key === 'value' ? parseFloat(value) : value;
        }
      }

      if (currentRate) await this.upsertRateData(currentRate);

      return 'Successfully parsed and imported data';
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getRewardsData(queryParams: IQueryParams): Promise<IFinalRewardData[]> {
    const { minDonation, rewardPool } = queryParams;

    if (minDonation && minDonation < 1)
      throw new HttpException(
        'minDonation should be at least 1',
        HttpStatus.BAD_REQUEST,
      );
    if (rewardPool && rewardPool < 1)
      throw new HttpException(
        'rewardPool should be at least 1',
        HttpStatus.BAD_REQUEST,
      );

    try {
      const rewardsData: IRawRewardData[] = await this.entityManager.query(`
        with employees_with_donations as (
            select distinct
                employees.id, employees.name, employees.surname, donations.amount, 
                donations.sign as d_sign, rates.sign as r_sign, rates.value 
            from employees 
            inner join donations on employees.id = donations."employeeId"
            left join rates on (rates.date = donations.date and rates.sign = donations.sign)
        ),
        employees_with_total_donations as (
            select id, name, surname, round(sum(amount * coalesce(value, 1)), 2) as "totalDonation"
            from employees_with_donations
            group by id, name, surname
        ),
        overall_total_donations as (
            select round(sum("totalDonation"), 2) as overall_total
            from employees_with_total_donations
        ), 
        employees_with_reward as (
            select employees_with_total_donations.*,
            case 
                when employees_with_total_donations."totalDonation" > ${minDonation ?? 100} then
                    round(employees_with_total_donations."totalDonation" / overall_total_donations.overall_total * ${rewardPool ?? 10000}, 2)
                else 0
            end as reward
            from employees_with_total_donations
            cross join overall_total_donations
        )
        select * from employees_with_reward;
    `);

      return rewardsData.map((rewardData: IRawRewardData) => ({
        ...rewardData,
        totalDonation: parseFloat(rewardData.totalDonation),
        reward: parseFloat(rewardData.reward),
      }));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  private getFormattedDataFromTxtFile(): IGetFormattedDataFromTxtFileResponse {
    const data: string = fs.readFileSync(PATH_TO_FILE, 'utf8');
    const normalizedData: string = data.replace(/\r\n/g, '\n');

    const employeesSplit: string[] = normalizedData.split('\n  ');
    const ratesSplit: string[] = normalizedData
      .split(/\bRates\b/)[1]
      .split('\n');

    return { employeesSplit, ratesSplit };
  }

  private async upsertEmployeeData(
    employeeData: ICurrentEmployee,
  ): Promise<void> {
    await this.entityManager.transaction(async transactionalEntityManager => {
      const { id, name, surname, department, donations, salary } = employeeData;

      await transactionalEntityManager.upsert(
        'Department',
        { id: department.id, name: department.name },
        ['id'],
      );

      await transactionalEntityManager.upsert(
        'Employee',
        {
          id,
          name,
          surname,
          departmentId: department.id,
        },
        ['id'],
      );

      for (const donation of donations) {
        await transactionalEntityManager.upsert(
          'Donation',
          {
            id: donation.id,
            date: donation.date,
            amount: donation.amount.split(' ')[0],
            sign: donation.amount.split(' ')[1],
            employeeId: id,
          },
          ['id'],
        );
      }

      for (const statement of salary) {
        await transactionalEntityManager.upsert(
          'Statement',
          {
            id: statement.id,
            date: statement.date,
            amount: statement.amount,
            employeeId: id,
          },
          ['id'],
        );
      }
    });
  }

  private async upsertRateData(rateData: ICurrentRate): Promise<void> {
    const { date, sign, value } = rateData;

    await this.ratesRepository.upsert({ date, sign, value }, ['id']);
  }
}
