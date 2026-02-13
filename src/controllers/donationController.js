const Donation = require('../models/Donation');
const Project = require('../models/Project');
const asyncHandler = require('../utils/asyncHandler');
const { sendDonationReceipt } = require('../services/mailService');

function makeReceiptRef() {
  return `DON-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

exports.createDonation = asyncHandler(async (req, res) => {
  const { nomDonateur, email, montant, projet, anonyme } = req.body;
  const project = await Project.findById(projet);
  if (!project) return res.status(404).json({ error: 'Projet introuvable' });

  const donation = await Donation.create({
    nomDonateur: anonyme ? 'Anonyme' : nomDonateur || 'Donateur',
    email: email || null,
    montant,
    anonyme: !!anonyme,
    projet,
    reçuRef: makeReceiptRef()
  });

  project.montantCollecte += Number(montant);
  await project.save();

  await sendDonationReceipt({
    to: donation.email,
    donorName: donation.nomDonateur,
    amount: donation.montant,
    projectTitle: project.titre,
    receiptRef: donation.reçuRef
  });

  res.status(201).json({ message: 'Don enregistré', receipt: donation.reçuRef });
});

exports.getAdminDonations = asyncHandler(async (_, res) => {
  const donations = await Donation.find().populate('projet', 'titre').sort({ createdAt: -1 }).lean();
  res.json(donations);
});
