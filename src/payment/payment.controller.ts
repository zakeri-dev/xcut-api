import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/stripe')
  createPayment(@Body() createPaymentDto: { userid: string }) {
    // console.log(createPaymentDto);
    return this.paymentService.createPayment(createPaymentDto);
  }

  @Get('/verify')
  verifyPayment(@Query('session_id') session_id: string, @Res() res: any) {
    // console.log(session_id);
    this.paymentService.verifyPayment(session_id);

    return res.redirect('https://xcuts.co.uk/');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }
}
