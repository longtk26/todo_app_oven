const config = () => ({
  port: process.env.PORT || 3000,
  env: process.env.ENV || 'dev',
  secretKey: process.env.SECRET_KEY,
  database: {
    postgresUri: process.env.POSTGRES_URI,
  },
  redis: {
    redisUri: process.env.REDIS_URI,
  },
  broker: {
    host: process.env.BROKER_HOST,
    port: process.env.BROKER_PORT,
  },
  email: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  },
});

export enum ConfigEnum {
  PORT = 'port',
  DATABASE_CONFIG = 'database',
  REDIS_CONFIG = 'redis',
  ENV = 'env',
  BROKER_CONFIG = 'broker',
  SECRET_KEY = 'secretKey',
  EMAIL_CONFIG = 'email',
}

export default config;
