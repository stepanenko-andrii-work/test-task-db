import { Column, ManyToOne, Entity, JoinColumn, PrimaryColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('transactions')
export abstract class Transaction {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'decimal', precision: 16, scale: 6, default: 0 })
  amount: number;

  @Column()
  date: Date;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  employeeId: number;
}
