import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from 'typeorm';

@Entity({name: 'alerts'})
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  name!: string;

  @Column()
  targetType!: 'stock' | 'watchlist' | 'portfolio';

  @Column()
  targetRef!: string;

  @Column({type: 'jsonb', default: () => "'{}'::jsonb"})
  rule!: {direction: 'up' | 'down'; threshold: number; compareTo: 'price' | 'change'};

  @Column({type: 'jsonb', default: () => "'[\"email\"]'::jsonb"})
  channels!: string[];

  @Column({default: true})
  active!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
