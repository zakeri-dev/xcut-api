import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import pb from 'lib/pb';
import axios from 'axios';

const stripe = require('stripe')(
  'sk_test_51Q8lBDQ2aujTRTPd9fybVZBFD8fsVptgLB5946WwBRELlPNsKaB2eBovm77gXLolAmL5XxMPHVGIYe13nnBin1Bj00w4ptiZ1I',
);

@Injectable()
export class PaymentService {
  async createPayment(createPaymentDto: { userid: string }, res) {
    // console.log(createPaymentDto.userid);
    const user = await pb
      .collection('users')
      .getFirstListItem(`id='${createPaymentDto.userid}'`, {
        expand: 'cart_full_sheets',
      });
    console.log(user);

    const cardItems = await user?.expand?.cart_full_sheets;

    const allprice = cardItems?.map((item: any) => item?.full_sheet_price);
    function sumArray(arr) {
      return arr.reduce((a, b) => a + b, 0);
    }
    // console.log('allprice', sumArray(allprice));
    // await this.PaymentSend(sumArray(allprice), user);
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'cart_full_sheets',
              description: user.id,
              images: ['https://i.ibb.co/fxpS6k7/Untitled-1.jpg'],
            },
            unit_amount: Math.round(sumArray(allprice) * 100),
            // Provide the exact Product ID (for example, prod_1234) of the product you want to sell
            // price: createPaymentDto.product,
            // quantity: 1,
          },
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://gate.xcuts.co.uk/verify?session_id=${user.id}`,
      cancel_url: `https://gate.xcuts.co.uk/verify?session_id=${user.id}`,
    });
    return {
      payment: session.url,
    };
  }

  async PaymentSend(price, user) {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'cart_full_sheets',
              description: user.id,
              images: ['https://i.ibb.co/fxpS6k7/Untitled-1.jpg'],
            },
            unit_amount: Math.round(price * 100),
            // Provide the exact Product ID (for example, prod_1234) of the product you want to sell
            // price: createPaymentDto.product,
            // quantity: 1,
          },
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://gate.xcuts.co.uk/verify?session_id=${user.id}`,
      cancel_url: `https://gate.xcuts.co.uk/verify?session_id=${user.id}`,
    });
    console.log(session.url);
    return session;
  }

  async verifyPayment() {
    return `This action returns all payment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
