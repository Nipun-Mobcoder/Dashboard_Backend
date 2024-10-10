import mongoose from 'mongoose';

const { Schema } = mongoose;

const PermissionSchema = new Schema({
  module: String,
  operation: {type: String, enum: ['Add', 'Delete', 'FetchAll', 'Update', 'Assign', 'Role']},
  isAllowed: {type: Boolean, default: false},
  user_id: {type: Schema.Types.ObjectId,required: true, ref:"User"}
});

const Permission = mongoose.model("Permission", PermissionSchema);

export default Permission;