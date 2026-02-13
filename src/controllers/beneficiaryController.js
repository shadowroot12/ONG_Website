const Beneficiary = require('../models/Beneficiary');
const asyncHandler = require('../utils/asyncHandler');

exports.getBeneficiaries = asyncHandler(async (_, res) => {
  const data = await Beneficiary.find().populate('projet', 'titre').sort({ createdAt: -1 }).lean();
  res.json(data);
});

exports.createBeneficiary = asyncHandler(async (req, res) => {
  const item = await Beneficiary.create(req.body);
  res.status(201).json(item);
});

exports.deleteBeneficiary = asyncHandler(async (req, res) => {
  const deleted = await Beneficiary.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Bénéficiaire introuvable' });
  res.json({ message: 'Bénéficiaire supprimé' });
});
