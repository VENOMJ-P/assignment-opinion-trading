import mongoose from "mongoose";

const TradeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  optionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Option",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  potentialReturn: {
    type: Number,
    required: true,
  },
  payout: {
    type: Number,
    default: 0,
  }, 
  status: {
    type: String,
    enum: ["pending", "settled", "cancelled"],
    default: "pending",
  },
  result: {
    type: Boolean,
    default: null,
  },
  settledAt: {
    type: Date,
  }, 
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Trade = mongoose.model("Trade", TradeSchema);
export default Trade;
