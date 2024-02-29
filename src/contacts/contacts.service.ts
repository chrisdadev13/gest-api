import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import type { Prisma, Contact } from '@prisma/client';
import { CreateDTO, UpdateDTO } from './dto/contacts.dto';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async contact(
    contactWhereUniqueInput: Prisma.ContactWhereUniqueInput,
  ): Promise<Contact | null> {
    return this.prisma.contact.findUnique({
      where: contactWhereUniqueInput,
    });
  }

  async contacts(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ContactWhereUniqueInput;
    where?: Prisma.ContactWhereInput;
  }): Promise<Contact[]> {
    const { skip, take, cursor, where } = params;

    return this.prisma.contact.findMany({
      skip,
      take,
      cursor,
      where,
    });
  }

  async contactById(userId: number, id: number) {
    const contact = await this.prisma.contact.findUniqueOrThrow({
      where: {
        userId,
        id,
      },
    });

    return contact;
  }

  async createContact(
    userId: number,
    data: CreateDTO,
  ): Promise<Contact | null> {
    const contactData = {
      ...data,
      userId,
    };

    return this.prisma.contact.create({
      data: contactData,
    });
  }

  async updateContact(params: {
    userId: number;
    contactId: number; // Contact Id
    data: UpdateDTO;
  }): Promise<Contact> {
    const { userId, contactId, data } = params;

    if (data.email || data.phone) {
      const alreadyExists = await this.prisma.contact.findFirst({
        where: {
          userId,
          id: { not: contactId },
          OR: [
            {
              email: data.email,
            },
            {
              phone: data.phone,
            },
          ],
        },
      });

      if (alreadyExists) {
        const conflictField =
          alreadyExists.email === data.email ? 'email' : 'phone';
        throw new ConflictException(
          `Contact with this ${conflictField} already exists`,
        );
      }
    }

    return this.prisma.contact.update({
      data,
      where: {
        id: contactId,
      },
    });
  }

  async deleteContact(where: Prisma.ContactWhereUniqueInput): Promise<Contact> {
    return this.prisma.contact.delete({
      where,
    });
  }
}
