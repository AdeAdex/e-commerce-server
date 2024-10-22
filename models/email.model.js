// admin.model.js

import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  texts: [{
    text: {
      type: String,
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
  }],
}, { timestamps: true });

const EmailModel = mongoose.model('Email', emailSchema);

export default EmailModel;
