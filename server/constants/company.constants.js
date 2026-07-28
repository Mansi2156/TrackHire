// Central source of truth for Company enums. Shared by the model (schema
// validation), the validators (request validation), and the frontend
// constants file so all three never drift apart.

// Not specified in docs/DATABASE_DESIGN.md (industry is documented as a
// free-standing field with no fixed list), so this is a reasonable
// industry-standard set covering the companies most job seekers track.
// Kept open-ended with "Other" so it never blocks a legitimate entry.
const INDUSTRIES = [
  "Technology",
  "Fintech",
  "E-Commerce",
  "Healthcare",
  "Education",
  "Developer Tools",
  "Social Media",
  "Productivity SaaS",
  "Gaming",
  "Media & Entertainment",
  "Telecommunications",
  "Finance & Banking",
  "Retail",
  "Manufacturing",
  "Automotive",
  "Real Estate",
  "Energy",
  "Government",
  "Non-Profit",
  "Consulting",
  "Other",
];

const SORT_OPTIONS = ["newest", "oldest", "name"];

module.exports = {
  INDUSTRIES,
  SORT_OPTIONS,
};