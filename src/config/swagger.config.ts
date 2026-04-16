import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Laundry API')
    .setDescription('REST API documentation for the Laundry Management System.')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Customers', 'Customer management endpoints')
    .addTag('Services', 'Laundry service catalog endpoints')
    .addTag('Orders', 'Order management endpoints')
    .addTag('Discount Rules', 'Discount rule management endpoints')
    .addTag('Health', 'Application health check')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
