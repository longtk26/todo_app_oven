const config = () => ({
    port: process.env.PORT || 3000,
    env: process.env.ENV || "dev",
    database: {
        postgresUri: process.env.POSTGRES_URI,
    },
    redis: {
        redisUri: process.env.REDIS_URI,
    },
})

export enum ConfigEnum {
    PORT = "port",
    DATABASE_CONFIG = "database",
    REDIS_CONFIG = "redis",
    ENV = "env"
}

export default config;