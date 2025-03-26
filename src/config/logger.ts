export const specConfigsPino = {
  pinoHttp: {
    transport:
      process.env.ENV !== 'prod'
        ? {
            target: 'pino-pretty',
            options: {
              ignore: 'app,req.headers,res',
            },
          }
        : undefined,
    base: {
      app: 'TODO APP OVEN',
    },
  },
};
