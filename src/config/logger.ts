export const specConfigsPino = {
  pinoHttp: {
    transport:
      process.env.ENV !== 'prod'
        ? {
            target: 'pino-pretty',
            options: {
              ignore: 'app,req,res',
            },
          }
        : undefined,
    base: {
      app: 'TODO APP OVEN',
    },
  },
};
