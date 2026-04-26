import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  signin() {
    return {
      msg: 'You are now signed in!',
    };
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
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // return the new user
      return user;
    } catch (err) {
        if (err instanceof PrismaClientKnownRequestError) {
            if(err.code === 'P2002'){
                throw new ForbiddenException('Crendtials Taken.')
            }
        }
        throw err;
    }
  }
}
