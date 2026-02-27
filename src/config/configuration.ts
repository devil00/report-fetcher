export default () => ({
    app: {
        name: process.env.APPNAME,
        version: process.env.APPVERSION,
        port: process.env.APP_PORT
    },
    postgres: {
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'NestJSDocker',
        host: process.env.DB_HOST || 'db',
        port: parseInt(process.env.DB_PORT || '5432', 10),
    },
    redis: {
        host: process.env.REDIS_HOST || 'redis',
        port: parseInt(process.env.REDIS_PORT  || '6379',  10), // 👈 Parse to number
        password: process.env.REDIS_PASSWORD || '',
        use_tls: false,
    },
    JWT_SECRET:  process.env.JWT_SECRET || 'default',
     kafka: {
        clientId: process.env.KAFKA_CLIENT_ID || 'nestjs-app',
        brokers: (process.env.KAFKA_BROKERS || 'kafka:29092').split(','),
        groupId: process.env.KAFKA_GROUP_ID || 'nestjs-consumer-group',
        ssl: process.env.KAFKA_SSL === 'true',
        sasl: process.env.KAFKA_SASL_ENABLED === 'true' ? {
            mechanism: process.env.KAFKA_SASL_MECHANISM || 'plain',
            username: process.env.KAFKA_SASL_USERNAME,
            password: process.env.KAFKA_SASL_PASSWORD,
        } : undefined,
        retry: {
            retries: parseInt(process.env.KAFKA_RETRIES || '10', 10),
            initialRetryTime: parseInt(process.env.KAFKA_RETRY_INITIAL_TIME || '300', 10),
            maxRetryTime: parseInt(process.env.KAFKA_RETRY_MAX_TIME || '30000', 10),
        },
    },
});