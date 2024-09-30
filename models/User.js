import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema({
  userName: String,
  email: { type: String, unique: true },
  password: String,
  isAdmin: {type: Boolean, default: false},
  role: {type: String, enum: ['Admin', 'Client', 'Engineer', 'Tester'], default: 'Client'},
  address: Schema.Types.Mixed
});

const User = mongoose.model("User", UserSchema);

export default User;