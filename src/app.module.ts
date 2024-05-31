import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { Donation } from './entities/donation.entity';
import { Employee } from './entities/employee.entity';
import { Statement } from './entities/statement.entity';
import { Rate } from './entities/rate.entity';
import { DataModule } from './data/data.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [Department, Donation, Employee, Rate, Statement],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    DataModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
