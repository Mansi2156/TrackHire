const asyncHandler = require("../utils/asyncHandler");
const companyService = require("../services/company.service");

// POST /api/companies
const createCompany = asyncHandler(async (req, res) => {
  const company = await companyService.createCompany(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: "Company added successfully",
    company,
  });
});

// GET /api/companies
const listCompanies = asyncHandler(async (req, res) => {
  const { companies, pagination } = await companyService.listCompanies(req.user._id, req.query);
  res.status(200).json({ success: true, companies, pagination });
});

// GET /api/companies/stats
const getOverallStats = asyncHandler(async (req, res) => {
  const stats = await companyService.getOverallStats(req.user._id);
  res.status(200).json({ success: true, stats });
});

// GET /api/companies/:id
const getCompany = asyncHandler(async (req, res) => {
  const company = await companyService.getOwnedCompany(req.user._id, req.params.id);
  res.status(200).json({ success: true, company });
});

// PUT /api/companies/:id
const updateCompany = asyncHandler(async (req, res) => {
  const company = await companyService.updateCompany(req.user._id, req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Company updated successfully",
    company,
  });
});

// DELETE /api/companies/:id
const deleteCompany = asyncHandler(async (req, res) => {
  await companyService.deleteCompany(req.user._id, req.params.id);
  res.status(200).json({ success: true, message: "Company deleted successfully" });
});

// GET /api/companies/:id/stats
const getCompanyStats = asyncHandler(async (req, res) => {
  const stats = await companyService.getCompanyStats(req.user._id, req.params.id);
  res.status(200).json({ success: true, stats });
});

// GET /api/companies/:id/applications
const listCompanyApplications = asyncHandler(async (req, res) => {
  const applications = await companyService.listCompanyApplications(req.user._id, req.params.id);
  res.status(200).json({ success: true, applications });
});

module.exports = {
  createCompany,
  listCompanies,
  getOverallStats,
  getCompany,
  updateCompany,
  deleteCompany,
  getCompanyStats,
  listCompanyApplications,
};