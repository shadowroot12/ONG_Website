const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    nomDonateur: { type: String, default: 'Donateur' },
    email: { type: String, default: null },
    montant: { type: Number, required: true, min: 1 },
    anonyme: { type: Boolean, default: false },
    projet: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    reçuRef: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Donation', donationSchema);
