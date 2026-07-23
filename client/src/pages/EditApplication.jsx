import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ApplicationForm from "../components/ApplicationForm";
import { useApplicationQuery, useUpdateApplicationMutation } from "../hooks/useApplications";

export default function EditApplication() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useApplicationQuery(id);
  const { mutateAsync, isPending } = useUpdateApplicationMutation(id);

  const handleSubmit = async (payload) => {
    try {
      await mutateAsync(payload);
      toast.success("Application updated");
      navigate(`/applications/${id}`);
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
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Edit Application</h1>
        <p className="mt-0.5 text-sm text-slate-500">Update this job opportunity</p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-card">
        <ApplicationForm
          defaultValues={data.application}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          submitLabel="Save Changes"
          onCancel={() => navigate(`/applications/${id}`)}
        />
      </div>
    </div>
  );
}
