import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import pb from 'lib/pb';
import axios from 'axios';
import directus from 'lib/directus';
import { login, readItems } from '@directus/sdk';

const stripe = require('stripe')(
  'sk_test_51OyZa5LOfTBWBd1ayk8C49xC8f4GFvRqnX58HWoOz09IHxKtPZT54wGEyQN6Gi8YhfjAjqkwiMtaBp8q6DMbSLoo00pp3ZqbNm',
);

@Injectable()
export class PaymentService {
  async createPayment(createPaymentDto: { userid: string }) {
    // console.log(createPaymentDto.userid);
    // directus.auth.static('N9WxXcaLtAzl-cNB2sXsLdZKmiG5Y3Pn');
    // await directus.setToken('lImJp4WJ20Toj6-LelPop-D9L3wZK5NY');
    // Now you can interact with your Directus instance
    const userd = await directus.request(
      login('spm@mzakeri.ir', 'Ss@46537678'),
    );
    // console.log(userd.access_token);

    const options = {
      method: 'GET',
      url: 'https://shop.xcuts.co.uk/users',
      params: {
        fields: 'cart_full_sheets.thickness_id.*',
        filter: { id: { _eq: createPaymentDto.userid } },
      },
      headers: {
        Authorization: `Bearer ${userd.access_token}`,
        'content-type': 'application/json',
      },
    };

    try {
      const { data } = await axios.request(options);
      // console.log(data?.data[0]);
      const allprice = data?.data[0]?.cart_full_sheets?.map(
        (item: any) => item?.thickness_id?.price_full_sheet,
      );
      // console.log(allprice);
      function sumArray(arr) {
        return arr.reduce((a, b) => a + b, 0);
      }
      // console.log(Math.round(sumArray(allprice) * 100));
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: 'cart_full_sheets',
                description: createPaymentDto.userid,
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
        success_url: `https://gate.xcuts.co.uk/verify?session_id=${createPaymentDto.userid}`,
        cancel_url: `https://gate.xcuts.co.uk/verify?session_id=${createPaymentDto.userid}`,
      });
      console.log('+++++++++', session);
      return {
        payment: session.url,
      };
    } catch (error) {
      console.error(error);
    }

    // const user = await pb
    //   .collection('users')
    //   .getFirstListItem(`id='${createPaymentDto.userid}'`, {
    //     expand: 'cart_full_sheets',
    //   });
    // console.log(user);

    // const cardItems = await user?.expand?.cart_full_sheets;

    // const allprice = cardItems?.map((item: any) => item?.full_sheet_price);
    // function sumArray(arr) {
    //   return arr.reduce((a, b) => a + b, 0);
    // }
    // console.log('allprice', sumArray(allprice));
    // await this.PaymentSend(sumArray(allprice), user);
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
    // console.log(session.url);
    return session.url;
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
