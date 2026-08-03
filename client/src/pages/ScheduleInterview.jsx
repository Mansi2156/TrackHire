import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { HiArrowLeft } from "react-icons/hi";
import InterviewForm from "../components/InterviewForm";
import { useCreateInterviewMutation } from "../hooks/useInterviews";

export default function ScheduleInterview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Supports deep-linking from Application Details' "+ Schedule Interview"
  // link (/interviews/new?applicationId=...) so the picker comes preselected.
  const preselectedApplicationId = searchParams.get("applicationId") || "";
  const { mutateAsync, isPending } = useCreateInterviewMutation();

  const handleSubmit = async (payload) => {
    try {
      const data = await mutateAsync(payload);
      toast.success("Interview scheduled successfully");
      navigate(`/interviews/${data.interview._id}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 sm:px-10">
      <Link
        to="/interviews"
        className="group mb-6 flex items-center gap-2 text-sm text-slate-500 transition-smooth hover:text-slate-700"
      >
        <HiArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Interviews
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Schedule Interview</h1>
        <p className="mt-0.5 text-sm text-slate-500">Add a new interview to your tracker</p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-card">
        <InterviewForm
          defaultValues={preselectedApplicationId ? { applicationId: preselectedApplicationId } : undefined}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          submitLabel="Schedule Interview"
          onCancel={() => navigate("/interviews")}
        />
      </div>
    </div>
  );
}
