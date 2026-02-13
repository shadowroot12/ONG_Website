const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    budget: { type: Number, default: 0, min: 0 },
    montantCollecte: { type: Number, default: 0, min: 0 },
    dateDebut: { type: Date },
    dateFin: { type: Date },
    actif: { type: Boolean, default: true },
    imageUrl: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
