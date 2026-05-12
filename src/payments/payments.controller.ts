import {
  Controller,
  Post,
  Req,
  Headers,
  Body,
} from '@nestjs/common';

import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {

  constructor(
    private paymentsService: PaymentsService,
  ) {}

  @Post('create-checkout-session')
  createCheckoutSession(@Body() body: any) {
    return this.paymentsService.createCheckoutSession(
      body.plan,
      body.userId,
    );
  }

  @Post('webhook')
  webhook(
    @Req() req: any,
    @Headers('stripe-signature') sig: string,
  ) {
    return this.paymentsService.handleWebhook(
      req,
      sig,
    );
  }
}