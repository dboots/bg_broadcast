import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const result = await stripe.customers.create({
    description: `Test Customer from Next.js ${new Date().toISOString()}`,
  });

  //const result = await stripe.customers.retrieve('cus_P7IYKysdErtVMn');

  res.status(200).json({ body: result.id });
}
