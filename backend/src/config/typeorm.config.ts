import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export default registerAs('database', (): TypeOrmModuleOptions => {
  const isLocal = process.env.NODE_ENV === 'local';
  return {
    type: 'postgres',
    host: isLocal
      ? process.env.DATABASE_HOST_LOCAL_ || '127.0.0.1'
      : process.env.DATABASE_HOST_ || 'localhost',
    port: parseInt(
      isLocal
        ? process.env.DATABASE_PORT_LOCAL_ || '5432'
        : process.env.DATABASE_PORT_ || '5432',
      10,
    ),
    username: isLocal
      ? process.env.DATABASE_USER_LOCAL_ || 'sam_local_code'
      : process.env.DATABASE_USER_ || 'technical_test',
    password: isLocal
      ? process.env.DATABASE_PASSWORD_LOCAL_ || 'passwd'
      : process.env.DATABASE_PASSWORD_ || '',
    database: isLocal
      ? process.env.DATABASE_NAME_LOCAL_ || 'technical_test_db_daka'
      : process.env.DATABASE_NAME_ || 'technical_test_db',

    entities: [join(__dirname, '/../**/*.entity{.ts,.js}')],

    synchronize: process.env.NODE_ENV_ !== 'production',

    logging: process.env.NODE_ENV_ !== 'production',
  };
});
