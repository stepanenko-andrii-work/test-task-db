import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('rates')
export class Rate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sign: string;

  @Column({ type: 'decimal', precision: 16, scale: 6, default: 0 })
  value: number;

  @Column()
  date: Date;
}
