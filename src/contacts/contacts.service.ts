import { Injectable } from '@nestjs/common';
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
    contactId: number; // Contact Id
    data: UpdateDTO;
  }): Promise<Contact> {
    const { contactId, data } = params;

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
