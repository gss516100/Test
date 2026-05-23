import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from 'typeorm';

@Entity({name: 'portfolios'})
export class Portfolio {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  name!: string;

  @Column({type: 'jsonb', default: () => "'[]'::jsonb"})
  holdings!: Array<{symbol: string; quantity: number; avgPrice: number}>;

  @Column({type: 'jsonb', default: () => "'{}'::jsonb"})
  metadata!: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
