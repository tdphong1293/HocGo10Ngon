import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	app.use(cookieParser());
	app.enableCors({
		origin: configService.get<string>('CLIENT_URL') || 'http://localhost:3000',
		credentials: true,
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
	});
	app.setGlobalPrefix('api/v1', { exclude: [''] });

	const config = new DocumentBuilder()
		.setTitle('HocGo10Ngon API')
		.setDescription('HocGo10Ngon API description')
		.setVersion('1.0')
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	const port = configService.get<number>('SERVER_PORT') || 8080;
	await app.listen(port);
}
bootstrap();
