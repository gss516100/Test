import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from 'typeorm';

@Entity({name: 'reports'})
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  title!: string;

  @Column()
  type!: 'daily' | 'monthly' | 'custom';

  @Column({type: 'jsonb', default: () => "'{}'::jsonb"})
  parameters!: Record<string, unknown>;

  @Column({type: 'jsonb', default: () => "'{}'::jsonb"})
  summary!: Record<string, unknown>;

  @Column({type: 'jsonb', default: () => "'[]'::jsonb"})
  recipients!: string[];

  @Column({default: false})
  emailed!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
