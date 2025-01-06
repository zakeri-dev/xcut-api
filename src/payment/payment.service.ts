import { Injectable, Redirect } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import pb from 'lib/pb';
import axios from 'axios';
import directus from 'lib/directus';
import { login, readItems } from '@directus/sdk';

const stripe = require('stripe')(
  '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',
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
      const allprice = data?.data[0]?.cart_full_sheets?.map((item: any) =>
        parseFloat(
          (
            item?.thickness_id?.price_full_sheet *
            (1 + item?.thickness_id?.tax_percent / 100)
          ).toFixed(2),
        ),
      );
      // console.log(allprice);
      function sumArray(arr) {
        return arr.reduce((a, b) => a + b, 0);
      }
      // console.log(sumArray(allprice));
      // console.log(Math.round(sumArray(allprice) * 100));
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              // defaultCountry: 'GB',
              currency: 'gbp',
              product_data: {
                name: 'cart_full_sheets',
                description: createPaymentDto.userid,
                images: [
                  'https://cms.xcuts.co.uk/assets/ece59885-603f-463b-8f56-2c9dfbaeccdb',
                ],
              },
              unit_amount: sumArray(allprice),
              // Provide the exact Product ID (for example, prod_1234) of the product you want to sell
              // price: createPaymentDto.product,
              // quantity: 1,
            },
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `https://gatei.xcuts.co.uk/payment/verify?session_id=${createPaymentDto.userid}`,
        cancel_url: `https://xcuts.co.uk/shop-online`,
      });
      // console.log('+++++++++', session);
      return {
        payment: session.url,
      };
    } catch (error) {
      console.error(error);
    }
  }

  async verifyPayment(session_id: string) {
    // console.log(session_id);

    const userd = await directus.request(
      login('spm@mzakeri.ir', 'Ss@46537678'),
    );

    // findeUser
    const findeUser = {
      method: 'GET',
      url: 'https://shop.xcuts.co.uk/users',
      params: {
        fields: 'cart_full_sheets.thickness_id.*',
        filter: { id: { _eq: session_id } },
      },
      headers: {
        Authorization: `Bearer ${userd.access_token}`,
        'content-type': 'application/json',
      },
    };

    try {
      const { data: findeUserData } = await axios.request(findeUser);
      // console.log(data?.data[0]);
      const allprice = findeUserData?.data[0]?.cart_full_sheets?.map(
        (item: any) =>
          parseFloat(
            (
              item?.thickness_id?.price_full_sheet *
              (1 + item?.thickness_id?.tax_percent / 100)
            ).toFixed(2),
          ),
      );
      // console.log(allprice);
      function sumArray(arr) {
        return arr.reduce((a, b) => a + b, 0);
      }
      // console.log(Math.round(sumArray(allprice) * 100));

      const cart_full_sheets = findeUserData?.data[0]?.cart_full_sheets?.map(
        (item: any) => {
          return { thickness_id: item?.thickness_id?.id };
        },
      );
      // console.log(cart_full_sheets);

      const createOrder = {
        method: 'POST',
        url: 'https://shop.xcuts.co.uk/items/orders',
        headers: {
          Authorization: `Bearer ${userd.access_token}`,
          'content-type': 'application/json',
        },
        data: {
          owner: [
            {
              directus_users_id: session_id,
            },
          ],
          total_price: await Math.round(sumArray(allprice) * 100),
          cart_full_sheets: await cart_full_sheets,
        },
      };

      try {
        const { data: createOrderData } = await axios.request(createOrder);
        console.log('createOrderData', createOrderData);

        const updateUser = {
          method: 'PATCH',
          url: `https://shop.xcuts.co.uk/users/${session_id}`,
          headers: {
            Authorization: `Bearer ${userd.access_token}`,
            'Content-Type': 'application/json',
          },
          data: {
            cart_full_sheets: [],
          },
        };

        try {
          const { data: updateUserData } = await axios.request(updateUser);
          console.log('updateUserData', updateUserData);
        } catch (error) {
          console.error(error);
        }
      } catch (error) {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
    }

    // i want to redirect to my site after payment
    return true;
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
