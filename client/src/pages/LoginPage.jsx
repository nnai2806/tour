import Container from "../components/Container";
import { FaEye, FaEyeSlash, FaKey } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../utils/validate";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { signInSuccess } from "../redux/user/userSlice";
import Loading from "../components/Loading";
import GoogleAuth from "../components/GoogleAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // States manage input's errors
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      setTimeout(() => {
        navigate("/");
        setLoading(false);
      }, [1000]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    // Validate email form user input
    if (formData.email) {
      if (!validateEmail(formData.email)) {
        setEmailError("Email không đúng định dạng!");
      } else {
        setEmailError("");
      }
    } else {
      if (formData.email !== undefined) {
        setEmailError("Vui lòng nhập email!");
      }
    }

    // Validate password
    if (formData.password === "") {
      setPasswordError("Vui lòng nhập mật khẩu!");
    } else {
      setPasswordError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Validate email form user input
    if (!formData.email) {
      setEmailError("Vui lòng nhập email!");
      return;
    } else if (!validateEmail(formData.email)) {
      setEmailError("Email không đúng định dạng!");
      return;
    } else if (!formData.password) {
      setPasswordError("Vui lòng nhập mật khẩu!");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post("/api/auth/signin", formData);
      if (res) {
        dispatch(signInSuccess(res.data));
        navigate("/");
      }
    } catch (error) {
      const { message } = error.response.data;
      if (message) {
        setMessage(message);
      }
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFormData = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value.trim() });
  };

  return (
    <Container>
      {isLoading && <Loading />}
      <div className="flex justify-center w-full">
        <form
          onSubmit={handleSubmit}
          className="bg-base-100 md:w-1/2 p-10 mx-4 shadow-slate-300 shadow-[0px_0px_5px_0px] rounded-lg"
        >
          <h1 className="text-4xl font-bold text-sky-600 mb-10 text-center">
            Đăng nhập
          </h1>
          {/* Email input */}
          <label className="form-control w-full mt-4">
            <div className="label p-0 py-2">
              <span className="label-text font-bold text-xl">
                Email <span className="text-rose-500">*</span>
              </span>
            </div>
            <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
              <MdEmail className="text-xl text-slate-500" />
              <input
                onChange={handleFormData}
                name="email"
                type="text"
                className="grow"
                placeholder="Nhập email..."
              />
            </label>
            {emailError && (
              <span className="text-rose-500 italic mt-1">{emailError}</span>
            )}
          </label>
          {/* Password input */}
          <label className="form-control w-full mt-4">
            <div className="label p-0 py-2">
              <span className="label-text font-bold text-xl">
                Mật khẩu <span className="text-rose-500">*</span>
              </span>
            </div>
            <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
              <FaKey className="text-xl text-slate-500" />
              <input
                onChange={handleFormData}
                name="password"
                type={showPassword ? "text" : "password"}
                className="grow"
                placeholder="Nhập mật khẩu..."
              />
              {showPassword ? (
                <FaEye
                  onClick={() => setShowPassword(false)}
                  className="text-xl text-slate-500 cursor-pointer"
                />
              ) : (
                <FaEyeSlash
                  onClick={() => setShowPassword(true)}
                  className="text-xl text-slate-500 cursor-pointer"
                />
              )}
            </label>
            {passwordError && (
              <span className="text-rose-500 italic mt-1">{passwordError}</span>
            )}
          </label>
          {/* Link sign up */}
          <div className="my-4 text-right font-semibold">
            <span>Chưa có tài khoản? </span>
            <Link className="text-sky-600" to={"/sign-up"}>
              Đăng ký ngay
            </Link>
          </div>

          {/* Show status login */}
          {message && (
            <div className="my-4">
              <div role="alert" className="alert alert-error">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 shrink-0 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{message}</span>
              </div>
            </div>
          )}

          {/* Login button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`flex justify-center items-center w-full text-xl
            font-bold uppercase text-white bg-rose-600 p-4 rounded-3xl ${
              isLoading ? "bg-slate-300" : "hover:bg-sky-600"
            }`}
          >
            <span>Đăng nhập</span>
            {isLoading && (
              <span className="ml-2 loading loading-dots loading-md"></span>
            )}
          </button>
          <h3 className="text-center text-xl font-semibold my-4 divider">
            hoặc
          </h3>
          {/* Google button */}
          <GoogleAuth />
        </form>
      </div>
    </Container>
  );
};

export default LoginPage;
