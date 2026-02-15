export default () => ({
    app: {
        name: process.env.APPNAME,
        version: process.env.APPVERSION,
        port: process.env.APP_PORT
    },
    postgres: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port:   process.env.DB_PORT,
    }
});