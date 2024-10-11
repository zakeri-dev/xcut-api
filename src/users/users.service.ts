import { Body, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import pb from 'lib/pb';
import axios from 'axios';

@Injectable()
export class UsersService {
  async create(body: any) {
    const record = await pb.collection('users').create(body);

    if (record) {
      pb.collection('users').requestVerification(body.email);
    }
    return {
      message: 'User created successfully',
    };
  }

  async sendCode(body: any) {
    // console.log(body);
    function generateRandomFourDigitNumber() {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      return randomNum;
    }
    const random4DigitNumber = generateRandomFourDigitNumber();

    const authData = await pb
      .collection('users')
      .authWithPassword(body.email, body.password);
    // console.log(authData);

    const update =
      authData &&
      (await pb.collection('users').update(authData.record.id, {
        vercode: random4DigitNumber,
        verjwt: authData.token,
      }));
    console.log(update);

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://notif.xcuts.co.uk/mail',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        email: body.email,
        code: random4DigitNumber,
      },
    };

    update &&
      axios
        .request(config)
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
        });

    return {
      message: 'Send code successfully',
    };
  }

  async verification(body: any) {
    console.log(body);
    const record = await pb
      .collection('users')
      .getFirstListItem(`email="${body.email}"`);
    console.log(record);
    if (record.vercode == body.otp) {
      console.log('first');
      return {
        access: record.verjwt,
      };
    }
    return {
      message: 'Code not found',
    };
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
