import { useContext, useRef } from "react";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input";
import googleIcon from "../images/google.png";
import { Link, Navigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";
import { authWithGoogle } from "../common/firebase";
import { z } from "zod";

const userAuthSchema = z.object({
  fullname: z
    .string()
    .min(3, { message: "Fullname must be at least 3 letters long" })
    .optional(),
  email: z
    .string()
    .email({ message: "Email is Invalid" })
    .nonempty({ message: "Enter Email" }),
  password: z
    .string()
    .min(6, { message: "Password should be at least 6 characters long" })
    .max(20, { message: "Password should not exceed 20 characters" })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/\d/, { message: "Password must contain at least one number" }),
});

const UserAuthForm = ({ type }) => {
  const {
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  const userAuthThroughServer = (serverRoute, formData) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
      .then(({ data }) => {
        storeInSession("user", JSON.stringify(data));
        setUserAuth(data);
      })
      .catch(({ response }) => {
        toast.error(response.data.error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(formElement);
    let formObject = {};
    for (let [key, value] of formData.entries()) {
      formObject[key] = value;
    }

    const result = userAuthSchema.safeParse(formObject);

    if (!result.success) {
      result.error.errors.forEach((error) => toast.error(error.message));
      return;
    }

    let serverRoute = type === "sign-in" ? "/signin" : "/signup";

    userAuthThroughServer(serverRoute, formObject);
  };

  const handleGoogleAuth = async (e) => {
    e.preventDefault();

    try {
      const user = await authWithGoogle();

      let serverRoute = "/google-auth";
      let formData = {
        access_token: user.accessToken,
      };

      userAuthThroughServer(serverRoute, formData);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
  };

  return access_token ? (
    <Navigate to="/" />
  ) : (
    <AnimationWrapper keyValue={type}>
      <section className="h-cover flex items-center justify-center">
        <Toaster />

        <form id="formElement" className="w-[80%] max-w-[400px]">
          <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
            {type == "sign-in" ? "Welcome Back" : "Join us today"}
          </h1>

          {type != "sign-in" ? (
            <InputBox
              name="fullname"
              type="text"
              placeholder="Full Name"
              icon="fi-rr-user"
            />
          ) : (
            ""
          )}

          <InputBox
            name="email"
            type="email"
            placeholder="Email"
            icon="fi-rr-envelope"
          />

          <InputBox
            name="password"
            type="password"
            placeholder="Password"
            icon="fi-rr-key"
          />

          <button
            className="btn-dark center mt-14"
            type="submit"
            onClick={handleSubmit}
          >
            {type.replace("-", " ")}
          </button>

          <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
            <hr className="w-1/2 border-black" />
            <p>or</p>
            <hr className="w-1/2 border-black" />
          </div>

          <button
            className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
            onClick={handleGoogleAuth}
          >
            <img src={googleIcon} className="w-5" />
            Continue with Google
          </button>

          {type == "sign-in" ? (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Don't have an account ?
              <Link to="/signup" className="underline text-black text-xl ml-1">
                Join us today
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Already a Member ?
              <Link to="/signin" className="underline text-black text-xl ml-1">
                Sign in here
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;
