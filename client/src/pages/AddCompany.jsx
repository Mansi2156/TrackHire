import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { HiArrowLeft } from "react-icons/hi";
import CompanyForm from "../components/CompanyForm";
import { useCreateCompanyMutation } from "../hooks/useCompanies";

export default function AddCompany() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateCompanyMutation();

  const handleSubmit = async (payload) => {
    try {
      const data = await mutateAsync(payload);
      toast.success("Company added successfully");
      navigate(`/companies/${data.company._id}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
      <Link
        to="/companies"
        className="group mb-6 flex items-center gap-2 text-sm text-slate-500 transition-smooth hover:text-slate-700"
      >
        <HiArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Companies
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Add New Company</h1>
        <p className="mt-0.5 text-sm text-slate-500">Save a company you want to track</p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-card">
        <CompanyForm
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          submitLabel="Add Company"
          onCancel={() => navigate("/companies")}
        />
      </div>
    </div>
  );
}
