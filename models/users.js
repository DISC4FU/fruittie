import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
   location: {
    type: String,
    
    minlength: 3
   },
    phoneNumber: {
    type: String,
  
    minlength: 6
    },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function(next){
  if (!this.isModified("password")) return ;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword){
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);