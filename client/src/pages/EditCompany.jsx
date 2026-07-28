import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { HiArrowLeft } from "react-icons/hi";
import CompanyForm from "../components/CompanyForm";
import { useCompanyQuery, useUpdateCompanyMutation } from "../hooks/useCompanies";

export default function EditCompany() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useCompanyQuery(id);
  const { mutateAsync, isPending } = useUpdateCompanyMutation(id);

  const handleSubmit = async (payload) => {
    try {
      await mutateAsync(payload);
      toast.success("Company updated successfully");
      navigate(`/companies/${id}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <div className="h-64 animate-pulse rounded-2xl border border-slate-100 bg-white" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
          {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
      <Link
        to={`/companies/${id}`}
        className="group mb-6 flex items-center gap-2 text-sm text-slate-500 transition-smooth hover:text-slate-700"
      >
        <HiArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Company
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Edit Company</h1>
        <p className="mt-0.5 text-sm text-slate-500">Update this company's details</p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-card">
        <CompanyForm
          defaultValues={data.company}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          submitLabel="Save Changes"
          onCancel={() => navigate(`/companies/${id}`)}
        />
      </div>
    </div>
  );
}
