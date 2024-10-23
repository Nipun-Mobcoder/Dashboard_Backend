import mongoose from 'mongoose';

const { Schema } = mongoose;

const PaymentSchema = new Schema({
  amount: { 
    type: Number, 
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Paytm', 'PhonePe', 'Paypal', 'GooglePay', 'ApplePay'],
    required: true
  },
  user_id: { 
    type: Schema.Types.ObjectId, 
    required: true, 
    ref: "User" 
  },
  from_id: { 
    type: Schema.Types.ObjectId, 
    required: true, 
    ref: "User" 
  },
  paymentDate: { 
    type: Date, 
    default: Date.now
  },
  currency: {
    type: String,
    default: 'USD'
  }
});

const Payment = mongoose.model("Payment", PaymentSchema);

export default Payment;