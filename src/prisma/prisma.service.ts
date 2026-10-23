import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL!;
    // The pg driver adapter ignores `?schema=` in the URL (the Prisma CLI does
    // not), so pass it explicitly to keep app queries and migrations aligned.
    const schema =
      new URL(connectionString).searchParams.get('schema') ?? undefined;

    super({
      adapter: new PrismaPg({ connectionString }, { schema }),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
