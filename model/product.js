const mongoose = require("mongoose");
const path= require("path");
const schema = mongoose.Schema;

const productSchema = new schema({
  name:{
    type: String,
    require: true
  },
  category:{
    type: String,
    require: true
  },
  quantity:{
    type: Number,
    require: true
  },
  description:{
    type: String,
    require: true
  },
  price:{
    type: Number,
    require:true
  },
  imageUrl:[{
    type: String,
    default: path.join('images','noprofile.png')
  }],
  eachrating:[{
    user:{ 
      type: schema.Types.ObjectId,
      ref:'users'
    },
    rate:{
    type: Number,
    require: false,
    min:1,
    max:5,
    },
    userreview:{
      type: String,
      require: false,
    },
  }],
  avgrating:{ 
      type: Number,
      require: false,
  }
}
)

module.exports = mongoose.model("product",productSchema);