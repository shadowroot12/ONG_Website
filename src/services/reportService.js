function buildReportJson({ totalDons, totalProjects, totalBeneficiaries, donations }) {
  return {
    generatedAt: new Date().toISOString(),
    metrics: { totalDons, totalProjects, totalBeneficiaries },
    recentDonations: donations
  };
}

module.exports = { buildReportJson };
