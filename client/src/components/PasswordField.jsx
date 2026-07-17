import { forwardRef, useState } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import TextField from "./TextField";

const PasswordField = forwardRef(function PasswordField(props, ref) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      ref={ref}
      type={visible ? "text" : "password"}
      rightElement={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="text-slate-400 transition-smooth hover:text-slate-600"
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {visible ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
        </button>
      }
    />
  );
});

export default PasswordField;
