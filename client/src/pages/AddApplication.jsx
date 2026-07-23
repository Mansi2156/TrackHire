import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ApplicationForm from "../components/ApplicationForm";
import { useCreateApplicationMutation } from "../hooks/useApplications";

export default function AddApplication() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateApplicationMutation();

  const handleSubmit = async (payload) => {
    try {
      const data = await mutateAsync(payload);
      toast.success("Application added");
      navigate(`/applications/${data.application._id}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Add New Application</h1>
        <p className="mt-0.5 text-sm text-slate-500">Track a new job opportunity</p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-card">
        <ApplicationForm
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          submitLabel="Save Application"
          onCancel={() => navigate("/applications")}
        />
      </div>
    </div>
  );
}
