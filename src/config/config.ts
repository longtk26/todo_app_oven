const config = () => ({
    port: process.env.PORT || 3000,
    env: process.env.ENV || "dev",
    database: {
        postgresUri: process.env.POSTGRES_URI,
    },
    redis: {},
})

export enum ConfigEnum {
    PORT = "port",
    DATABASE_CONFIG = "database",
    ENV = "env"
}

export default config;