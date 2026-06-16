import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class PaymentsService {

    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,
    ) { }
    private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2026-04-22.dahlia',
    });

    async createCheckoutSession(
        plan: string,
        userId: string
    ) {

        let amount = 0;
        let name = '';

        if (plan === 'pro') {
            amount = 900;
            name = 'Pro Plan';
        }

        if (plan === 'premium') {
            amount = 1900;
            name = 'Premium Plan';
        }

        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],

            line_items: [
                {
                    price_data: {
                        currency: 'usd',

                        product_data: {
                            name,
                        },

                        unit_amount: amount,
                    },

                    quantity: 1,
                },
            ],

            mode: 'payment',

            metadata: {
                userId,
                plan,
            },

            success_url: process.env.FRONTEND_URL + "/payment-success",
            cancel_url: process.env.FRONTEND_URL + "/payment-cancel",
        });

        return {
            url: session.url,
        };
    }

    async handleWebhook(payload: Buffer, sig: string) {

    const endpointSecret =
        process.env.STRIPE_WEBHOOK_SECRET!;

    const event = this.stripe.webhooks.constructEvent(
        payload,
        sig,
        endpointSecret,
    );

    if (event.type === 'checkout.session.completed') {
        const session: any = event.data.object;

        const userId = session.metadata.userId;
        const plan = session.metadata.plan;

        await this.userModel.findByIdAndUpdate(userId, {
            plan,
            planExpiresAt: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000,
            ),
        });

        console.log('✅ PLAN + EXPIRY SET');
    }

    return {
        received: true,
    };
}
}
