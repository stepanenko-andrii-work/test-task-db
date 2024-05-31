import { Transaction } from './transaction.entity';
import { Column, Entity } from 'typeorm';

@Entity('donations')
export class Donation extends Transaction {
  @Column()
  sign: string;
}
