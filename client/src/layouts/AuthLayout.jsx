import { HiLightningBolt } from "react-icons/hi";

// Split-screen layout shared by Login and Register: a purple gradient
// brand panel on the left (content supplied by the page), and the
// actual form on the right.
export default function AuthLayout({ panel, children }) {
  return (
    <div className="min-h-screen bg-white lg:flex">
      {/* Left Panel */}
      <div className="hidden lg:block lg:w-1/2">
        {panel}
      </div>

      {/* Right Panel */}
      <div className="flex min-h-screen flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
