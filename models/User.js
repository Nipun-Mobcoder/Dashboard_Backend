import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema({
  userName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isAdmin: {type: Boolean, default: false},
  role: {type: String, enum: ['Admin', 'Client', 'Engineer', 'Tester'], default: 'Client'},
  walletAmount: Number,
  address: Schema.Types.Mixed,
  phoneNumber: Number  
});

const User = mongoose.model("User", UserSchema);

export default User;