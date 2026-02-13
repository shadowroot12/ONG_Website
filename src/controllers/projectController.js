const Project = require('../models/Project');
const asyncHandler = require('../utils/asyncHandler');

exports.getPublicProjects = asyncHandler(async (_, res) => {
  const projects = await Project.find({ actif: true }).sort({ createdAt: -1 }).lean();
  res.json(projects);
});

exports.getAdminProjects = asyncHandler(async (_, res) => {
  const projects = await Project.find().sort({ createdAt: -1 }).lean();
  res.json(projects);
});

exports.createProject = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) payload.imageUrl = `/uploads/${req.file.filename}`;
  const project = await Project.create(payload);
  res.status(201).json(project);
});

exports.updateProject = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) payload.imageUrl = `/uploads/${req.file.filename}`;
  const project = await Project.findByIdAndUpdate(req.params.id, payload, { new: true });
  if (!project) return res.status(404).json({ error: 'Projet introuvable' });
  res.json(project);
});

exports.deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return res.status(404).json({ error: 'Projet introuvable' });
  res.json({ message: 'Projet supprimé' });
});
