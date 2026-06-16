import {
  Controller,
  Post,
  Req,
  Headers,
  Body,
  HttpCode
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
@HttpCode(200)
handleWebhook(
  @Req() req: any,
  @Headers('stripe-signature') signature: string,
) {
  return this.paymentsService.handleWebhook(
    req.body,
    signature,
  );
}
}
