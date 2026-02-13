const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    age: { type: Number, min: 0 },
    localite: { type: String, default: '' },
    projet: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Beneficiary', beneficiarySchema);
