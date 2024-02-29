import {
  Controller,
  Post,
  UseGuards,
  Body,
  Res,
  InternalServerErrorException,
  Put,
  Param,
  Get,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { CreateDTO, ParamDTO, UpdateDTO } from './dto/contacts.dto';
import { User } from 'src/user/decorators/user.decorator';
import { User as UserEntity } from '@prisma/client';
import { ContactsService } from './contacts.service';
import { Response } from 'express';
import { ErrorMessage } from 'src/utils/error';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactService: ContactsService) {}

  @Get('/')
  async list(
    @User() user: UserEntity,
    @Query('skip') skip: string,
    @Query('take') take: string = '10',
  ) {
    try {
      const contacts = await this.contactService.contacts({
        skip: parseInt(skip),
        take: parseInt(take),
        where: {
          userId: user.id,
        },
      });

      return contacts;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(ErrorMessage.SomethingWentWrong);
    }
  }

  @Get('/:id')
  async getOneById(
    @User() user: UserEntity,
    @Param() contactParam: ParamDTO,
    @Res() response: Response,
  ) {
    try {
      const contact = await this.contactService.contact({
        id: parseInt(contactParam.id),
        userId: user.id,
      });

      if (!contact) {
        throw new NotFoundException('Contact not found');
      }

      response.status(200).send({ contact });
    } catch (error) {
      throw new InternalServerErrorException(ErrorMessage.SomethingWentWrong);
    }
  }

  @Post()
  async create(
    @User() user: UserEntity,
    @Body() createDto: CreateDTO,
    @Res() response: Response,
  ) {
    try {
      console.log(user);
      const newContact = await this.contactService.createContact(
        user.id,
        createDto,
      );

      if (!newContact) {
        throw new InternalServerErrorException('Something bad happened');
      }

      response.status(201).send({ newContact });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        error,
        ErrorMessage.SomethingWentWrong,
      );
    }
  }

  @Put('/:id')
  async update(
    @User() user: UserEntity,
    @Param() updateParam: ParamDTO,
    @Body() updateDto: UpdateDTO,
    @Res() response: Response,
  ) {
    try {
      const contact = await this.contactService.updateContact({
        userId: user.id,
        contactId: parseInt(updateParam.id),
        data: updateDto,
      });

      if (!contact) {
        throw new InternalServerErrorException('Something bad happened');
      }

      response.status(201).send({ contact });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        error,
        ErrorMessage.SomethingWentWrong,
      );
    }
  }
}
