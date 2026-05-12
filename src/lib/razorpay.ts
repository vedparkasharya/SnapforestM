import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export function createRazorpayOrder(amount: number, receipt: string) {
  return razorpay.orders.create({
    amount: amount * 100,
    currency: 'INR',
    receipt,
    notes: {
      platform: 'SnapforestX',
    },
  });
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
) {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');
  
  return expectedSignature === signature;
}

export default razorpay;
