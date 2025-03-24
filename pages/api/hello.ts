import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = new Stripe('sk_test_RIcGuV6eFYj1BOoNV1xPMnEi');
//   const result = await stripe.customers.create({
//     description: 'Test Customer from Next.js',
//   });

  const result = await stripe.customers.retrieve('cus_P7IYKysdErtVMn');

  console.log(result);
  res.status(200).json({ body: result });
}
