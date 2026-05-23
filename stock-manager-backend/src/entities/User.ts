import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from 'typeorm';

@Entity({name: 'users'})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({unique: true})
  email!: string;

  @Column({nullable: true})
  name?: string;

  @Column({nullable: true})
  passwordHash?: string;

  @Column({nullable: true})
  googleId?: string;

  @Column({type: 'jsonb', default: () => "'{}'::jsonb"})
  preferences!: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
