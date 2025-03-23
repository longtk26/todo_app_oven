import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const settingSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('TODO APP API')
    .setDescription('The TODO APP API description')
    .setVersion('1.0')
    .addTag('Todo app')
    .addSecurity('bearer', {
      type: 'http',
      scheme: 'bearer',
    })
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    yamlDocumentUrl: 'swagger/yaml',
  });
};
