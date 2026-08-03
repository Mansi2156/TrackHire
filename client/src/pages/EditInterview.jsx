import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { HiArrowLeft } from "react-icons/hi";
import InterviewForm from "../components/InterviewForm";
import { useInterviewQuery, useUpdateInterviewMutation } from "../hooks/useInterviews";

export default function EditInterview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useInterviewQuery(id);
  const { mutateAsync, isPending } = useUpdateInterviewMutation(id);

  const handleSubmit = async (payload) => {
    try {
      await mutateAsync(payload);
      toast.success("Interview updated successfully");
      navigate(`/interviews/${id}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 sm:px-10">
        <div className="h-64 animate-pulse rounded-2xl border border-slate-100 bg-white" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 sm:px-10">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
          {error.message}
        </div>
      </div>
    );
  }

  const interview = data.interview;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 sm:px-10">
      <Link
        to={`/interviews/${id}`}
        className="group mb-6 flex items-center gap-2 text-sm text-slate-500 transition-smooth hover:text-slate-700"
      >
        <HiArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Interview
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Edit Interview</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Editing {interview.applicationId?.company} &middot; {interview.round}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-card">
        <InterviewForm
          defaultValues={interview}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          submitLabel="Save Changes"
          onCancel={() => navigate(`/interviews/${id}`)}
        />
      </div>
    </div>
  );
}
