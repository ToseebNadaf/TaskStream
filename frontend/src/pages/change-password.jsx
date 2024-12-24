import { useContext, useRef } from "react";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { UserContext } from "../App";
import { z } from "zod";

const passwordSchema = z.object({
  currentPassword: z
    .string()
    .min(6, "Password must be at least 6 characters long.")
    .max(20, "Password must not exceed 20 characters.")
    .regex(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/,
      "Password must include at least one numeric digit, one lowercase letter, and one uppercase letter."
    ),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters long.")
    .max(20, "Password must not exceed 20 characters.")
    .regex(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/,
      "Password must include at least one numeric digit, one lowercase letter, and one uppercase letter."
    ),
});

const ChangePassword = () => {
  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  const changePasswordForm = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData(changePasswordForm.current);
    const formData = Object.fromEntries(form.entries());

    const validationResult = passwordSchema.safeParse(formData);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(
        (err) => err.message
      );
      return toast.error(errorMessages.join(" "));
    }

    const { currentPassword, newPassword } = formData;

    e.target.setAttribute("disabled", true);
    const loadingToast = toast.loading("Updating password...");

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/change-password`,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `${access_token}`,
          },
        }
      );

      toast.dismiss(loadingToast);
      toast.success("Password updated successfully.");
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to update password.";
      toast.dismiss(loadingToast);
      toast.error(errorMessage);
    } finally {
      e.target.removeAttribute("disabled");
    }
  };

  return (
    <AnimationWrapper>
      <Toaster />
      <form
        ref={changePasswordForm}
        className="flex flex-col items-center justify-start min-h-screen"
      >
        <h1 className="max-md:hidden capitalize font-bold text-3xl">
          Change Password
        </h1>

        <div className="py-10 w-full md:max-w-[400px]">
          <InputBox
            name="currentPassword"
            type="password"
            className="profile-edit-input"
            placeholder="Current Password"
            icon="fi-rr-unlock"
          />
          <InputBox
            name="newPassword"
            type="password"
            className="profile-edit-input"
            placeholder="New Password"
            icon="fi-rr-unlock"
          />

          <button
            onClick={handleSubmit}
            className="btn-dark px-[9.5rem] mt-10"
            type="submit"
          >
            Change Password
          </button>
        </div>
      </form>
    </AnimationWrapper>
  );
};

export default ChangePassword;
