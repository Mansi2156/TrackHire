import Modal from "./Modal";

// A small, reusable confirm-before-destructive-action dialog, built on the
// generic Modal shell (same pattern as EditResumeModal/UploadResumeModal).
// Not built on the shared Button component: Button hardcodes the brand
// (indigo) background, which a plain className override can't reliably
// beat for the "danger" variant, so the button markup is inlined here
// instead, matching Button's structure/loading-spinner treatment.
export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading = false,
  variant = "danger",
  onConfirm,
  onClose,
}) {
  const confirmButtonClass =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 focus:ring-red-500/40"
      : "bg-brand-600 hover:bg-brand-700 focus:ring-brand-500/40";

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium text-slate-500 transition-smooth hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition-smooth focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${confirmButtonClass}`}
          >
            {isLoading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}
