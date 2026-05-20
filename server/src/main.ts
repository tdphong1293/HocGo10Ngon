import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { DatabaseService } from './modules/mongoose/database.service';
import { sessionModeData } from '../mongoose/seed';
import bodyParser from 'body-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	app.use(bodyParser.json({ limit: '1mb' }));
	app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));
	app.use(cookieParser());
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
		})
	);
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
		.addBearerAuth(
			{ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
			'access-token'
		)
		.build();
	const document = SwaggerModule.createDocument(app, config);
	document.security = [{ 'access-token': [] }];
	SwaggerModule.setup('api', app, document, {
		swaggerOptions: { persistAuthorization: true },
	});

	if (sessionModeData && sessionModeData.length > 0) {
		const databaseService = app.get(DatabaseService);
		await databaseService.seedSessionModes(sessionModeData, true);
	}

	const port = configService.get<number>('SERVER_PORT') || 8080;
	await app.listen(port);
}
bootstrap();
