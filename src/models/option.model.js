import mongoose from "mongoose";

const OptionSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  odds: {
    type: Number,
    required: true,
  },
  result: {
    type: Boolean,
    default: null,
  },
});

const Option = mongoose.model("Option", OptionSchema);
export default Option;
