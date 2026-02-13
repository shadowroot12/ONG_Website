const asyncHandler = require('../utils/asyncHandler');

exports.getNgoProfile = asyncHandler(async (_, res) => {
  res.json({
    nom: 'ONGConnect',
    description:
      'ONGConnect soutient les communautés vulnérables à travers des projets d’eau, d’éducation, de nutrition et de santé.',
    email: 'contact@ongconnect.org',
    telephone: '+243 900 000 000'
  });
});
