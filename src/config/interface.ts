export interface DatabaseConfig {
  postgresUri: string;
}

export interface RedisConfig {
  redisUri: string;
}

export interface BrokerConfig {
  host: string;
  port: string;
}

export interface EmailConfig {
  user: string;
  password: string;
  host: string;
  port: string;
  isSecure: boolean;
  service: string;
}
