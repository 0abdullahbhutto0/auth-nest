import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
    
    constructor(private prisma: PrismaService){
        
    }

    signin() {
        return {
            'msg': 'You are now signed in!'
        }
    }

    signup() {
        return {
            'msg': 'You are now signed up!'
        }
    }
}
