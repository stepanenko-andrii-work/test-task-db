import { Module } from '@nestjs/common';
import { DataService } from './data.service';
import { DataController } from './data.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from '../entities/department.entity';
import { Donation } from '../entities/donation.entity';
import { Employee } from '../entities/employee.entity';
import { Rate } from '../entities/rate.entity';
import { Statement } from '../entities/statement.entity';
import { Transaction } from '../entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Department,
      Donation,
      Employee,
      Rate,
      Statement,
      Transaction,
    ]),
  ],
  controllers: [DataController],
  providers: [DataService],
})
export class DataModule {}
