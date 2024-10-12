import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [UsersModule, PaymentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
