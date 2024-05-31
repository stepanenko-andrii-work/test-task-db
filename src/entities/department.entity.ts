import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('departments')
export class Department {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;
}
