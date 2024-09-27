import mongoose from 'mongoose';

const { Schema } = mongoose;

const PermissionSchema = new Schema({
  module: String,
  operation: {type: String, enum: ['Add', 'Delete', 'FetchAll', 'Update', 'Assign']},
  isAllowed: {type: Boolean, default: false}
});

const Permission = mongoose.model("Permission", PermissionSchema);

export default Permission;