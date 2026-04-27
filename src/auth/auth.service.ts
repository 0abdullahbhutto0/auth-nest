import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signin(dto: AuthDto) {
    //find the user
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    //if != exit throw err
    if (!user) throw new ForbiddenException('Incorrect Credentials.');

    //compare passwords
    const passMatch = await argon.verify(user.hash, dto.password);
    //if pass != match throw wrong err
    if (!passMatch) throw new ForbiddenException('Incorrent Credentials');
    //signin if successfull, send the user
    const {hash, ...noHashUser} = user;
    return noHashUser;

  }

  async signup(dto: AuthDto) {
    //Password Hash
    const hash = await argon.hash(dto.password);
    //save the user to the db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      // return the new user
      const {hash: _, ...noHashUser} = user;
      return noHashUser;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ForbiddenException('Crendtials Taken.');
        }
      }
      throw err;
    }
  }
}
