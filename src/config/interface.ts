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