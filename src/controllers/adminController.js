const Donation = require('../models/Donation');
const Project = require('../models/Project');
const Beneficiary = require('../models/Beneficiary');
const asyncHandler = require('../utils/asyncHandler');
const { buildReportJson } = require('../services/reportService');

exports.getStats = asyncHandler(async (_, res) => {
  const [donAgg] = await Donation.aggregate([{ $group: { _id: null, total: { $sum: '$montant' } } }]);
  const totalDons = donAgg?.total || 0;
  const beneficiaires = await Beneficiary.countDocuments();
  const projetsActifs = await Project.countDocuments({ actif: true });
  res.json({ totalDons, beneficiaires, projetsActifs });
});

exports.getReport = asyncHandler(async (_, res) => {
  const [donAgg] = await Donation.aggregate([{ $group: { _id: null, total: { $sum: '$montant' } } }]);
  const totalDons = donAgg?.total || 0;
  const totalProjects = await Project.countDocuments();
  const totalBeneficiaries = await Beneficiary.countDocuments();
  const donations = await Donation.find().sort({ createdAt: -1 }).limit(20).lean();

  const report = buildReportJson({ totalDons, totalProjects, totalBeneficiaries, donations });
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="rapport-ongconnect.json"');
  res.send(JSON.stringify(report, null, 2));
});
