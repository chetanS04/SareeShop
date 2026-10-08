import { Controller, Post, Get, Body, Request, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller()
export class PaymentController {
  constructor(private svc: PaymentService) {}

  @Get('test-razorpay')
  testRazorpayCredentials(): Promise<any> {
    return this.svc.testCredentials();
  }

  @Get('payment/methods')
  getPaymentMethods(): Promise<any> {
    return this.svc.getAvailableMethods();
  }

  @Get('payment/recent-attempts')
  getRecentAttempts(): Promise<any> {
    return this.svc.getRecentPaymentAttempts();
  }

  @UseGuards(JwtAuthGuard)
  @Post('payment/initiate')
  initiate(@Request() req: any, @Body() b: any): Promise<any> {
    return this.svc.initiatePayment(req.user.id, req.user, b);
  }

  @UseGuards(JwtAuthGuard)
  @Post('payment/cancel')
  cancel(@Request() req: any, @Body() b: any): Promise<any> {
    return this.svc.cancelPayment(req.user.id, b.order_number || b.order_id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('payment/log-failure')
  logFailure(@Request() req: any, @Body() b: any): Promise<any> {
    return this.svc.logClientFailure(req.user.id, b);
  }

  @UseGuards(JwtAuthGuard)
  @Post('payment/verify')
  verify(@Request() req: any, @Body() b: any): Promise<any> {
    return this.svc.verifyPayment(b);
  }

  @Post('payment/webhook')
  webhook(@Body() b: any): Promise<any> {
    return this.svc.verifyPayment(b);
  }
}

