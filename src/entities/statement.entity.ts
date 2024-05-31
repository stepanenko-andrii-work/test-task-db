import { Transaction } from './transaction.entity';
import { Entity } from 'typeorm';

@Entity('statements')
export class Statement extends Transaction {}
