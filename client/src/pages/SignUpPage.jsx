import { MdEmail, MdPlace } from "react-icons/md";
import Container from "../components/Container";
import { useEffect, useState } from "react";
import {
  FaBirthdayCake,
  FaEye,
  FaEyeSlash,
  FaIdCard,
  FaKey,
  FaPhone,
  FaUser,
} from "react-icons/fa";
import GoogleAuth from "../components/GoogleAuth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  validateEmail,
  validateIdentifierCard,
  validatePhoneNumber,
} from "../utils/validate";
import Loading from "../components/Loading";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // States manage input's errors
  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [rePasswordError, setRePasswordError] = useState("");

  const handleFormData = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value.trim() });
  };

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
    // Validate fullName input
    if (formData.fullName === "") {
      setFullNameError("Vui lòng nhập họ tên!");
    } else {
      setFullNameError("");
    }

    // Validate email input
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
    if (formData.password) {
      if (formData.password === "") {
        setPasswordError("Vui lòng nhập mật khẩu!");
      } else {
        if (formData.password.length < 6) {
          setPasswordError("Mật khẩu tối thiểu 6 ký tự!");
        } else {
          setPasswordError("");
        }
      }
    }

    // Validate re-password
    if (formData.rePassword !== formData.password) {
      setRePasswordError("Mật khẩu không khớp!");
    } else {
      setRePasswordError("");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.fullName) {
      setFullNameError("Vui lòng nhập họ tên!");
      return;
    } else if (!formData.email) {
      setEmailError("Vui lòng nhập email!");
      return;
    } else if (!validateEmail(formData.email)) {
      setEmailError("Email không đúng định dạng!");
      return;
    } else if (!formData.password) {
      setPasswordError("Vui lòng nhập mật khẩu!");
      return;
    } else if (formData.password && formData.password.length < 6) {
      setPasswordError("Mật khẩu tối thiểu 6 ký tự!");
      return;
    } else if (formData.rePassword !== formData.password) {
      setRePasswordError("Mật khẩu không khớp!");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/signup", formData);
      if (res) {
        navigate("/login");
      }
    } catch (error) {
      const { message } = error.response.data;
      if (message) {
        if (message.includes("E11000")) {
          setMessage("Tài khoản đã tồn tại!");
        } else {
          setMessage(message);
        }
      }
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      {isLoading && <Loading />}
      <div className="flex justify-center w-full">
        <form
          onSubmit={handleSubmit}
          className="bg-base-100 md:w-3/4 p-10 mx-4 shadow-slate-300 shadow-[0px_0px_5px_0px] rounded-lg"
        >
          <h1 className="text-4xl font-bold text-sky-600 mb-4 text-center">
            Đăng ký tài khoản
          </h1>
          <div className="grid md:grid-cols-2 md:gap-6">
            {/* Fullname input */}
            <label className="form-control w-full mt-4">
              <div className="label p-0 py-2">
                <span className="label-text font-bold text-xl">
                  Họ tên <span className="text-rose-500">*</span>
                </span>
              </div>
              <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                <FaUser className="text-xl text-slate-500" />
                <input
                  onChange={handleFormData}
                  name="fullName"
                  type="text"
                  className="grow"
                  placeholder="Nhập họ và tên..."
                />
              </label>
              {fullNameError && (
                <span className="text-rose-500 italic mt-1">
                  {fullNameError}
                </span>
              )}
            </label>

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
                <span className="text-rose-500 italic mt-1">
                  {passwordError}
                </span>
              )}
            </label>

            {/* Date of birth input */}
            <label className="form-control w-full mt-4">
              <div className="label p-0 py-2">
                <span className="label-text font-bold text-xl">Ngày sinh</span>
              </div>
              <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                <FaBirthdayCake className="text-xl text-slate-500" />
                <input
                  onChange={handleFormData}
                  name="dateOfBirth"
                  type="date"
                  className="grow"
                  placeholder="Nhập email..."
                />
              </label>
            </label>

            {/* Re-Password input */}
            <label className="form-control w-full mt-4">
              <div className="label p-0 py-2">
                <span className="label-text font-bold text-xl">
                  Nhập lại mật khẩu <span className="text-rose-500">*</span>
                </span>
              </div>
              <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                <FaKey className="text-xl text-slate-500" />
                <input
                  onChange={handleFormData}
                  name="rePassword"
                  type={showRePassword ? "text" : "password"}
                  className="grow"
                  placeholder="Nhập lại mật khẩu..."
                />
                {showRePassword ? (
                  <FaEye
                    onClick={() => setShowRePassword(false)}
                    className="text-xl text-slate-500 cursor-pointer"
                  />
                ) : (
                  <FaEyeSlash
                    onClick={() => setShowRePassword(true)}
                    className="text-xl text-slate-500 cursor-pointer"
                  />
                )}
              </label>
              {rePasswordError && (
                <span className="text-rose-500 italic mt-1">
                  {rePasswordError}
                </span>
              )}
            </label>

            {/* Sex radio input */}
            <label className="form-control w-full mt-4">
              <div className="label p-0 py-2">
                <span className="label-text font-bold text-xl">Giới tính</span>
              </div>
              <fieldset className="flex items-center gap-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    onChange={handleFormData}
                    name="sex"
                    type="radio"
                    value={"Nam"}
                    className="radio"
                  />
                  Nam
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    onChange={handleFormData}
                    name="sex"
                    type="radio"
                    value={"Nữ"}
                    className="radio"
                  />
                  Nữ
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    defaultChecked
                    onChange={handleFormData}
                    name="sex"
                    type="radio"
                    value={"Chưa biết"}
                    className="radio"
                  />
                  Chưa biết
                </label>
              </fieldset>
            </label>

            {/* Phone input */}
            <label className="form-control w-full mt-4">
              <div className="label p-0 py-2">
                <span className="label-text font-bold text-xl">
                  Số điện thoại
                </span>
              </div>
              <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                <FaPhone className="text-xl text-slate-500" />
                <input
                  onChange={handleFormData}
                  name="phone"
                  type="text"
                  className="grow"
                  placeholder="Nhập số điện thoại..."
                />
              </label>
              {formData.phone !== undefined &&
                !validatePhoneNumber(formData.phone) && (
                  <span className="text-rose-500 italic mt-1">
                    Số điện thoại không đúng định dạng!
                  </span>
                )}
            </label>

            {/* Cccd input */}
            <label className="form-control w-full mt-4">
              <div className="label p-0 py-2">
                <span className="label-text font-bold text-xl">CCCD</span>
              </div>
              <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                <FaIdCard className="text-xl text-slate-500" />
                <input
                  onChange={handleFormData}
                  name="cccd"
                  type="text"
                  className="grow"
                  placeholder="Nhập cccd..."
                />
              </label>
              {formData.cccd !== undefined &&
                !validateIdentifierCard(formData.cccd) && (
                  <span className="text-rose-500 italic mt-1">
                    Không đúng định dạng!
                  </span>
                )}
            </label>

            {/* Address input */}
            <label className="form-control w-full mt-4">
              <div className="label p-0 py-2">
                <span className="label-text font-bold text-xl">Địa chỉ</span>
              </div>
              <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                <MdPlace className="text-xl text-slate-500" />
                <input
                  onChange={handleFormData}
                  name="address"
                  type="text"
                  className="grow"
                  placeholder="Nhập địa chỉ..."
                />
              </label>
            </label>
          </div>
          {/* Show status */}
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
          <div className="flex justify-center w-full mt-10">
            <div className="w-full md:w-1/2">
              {/* Login button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`flex justify-center items-center w-full text-xl font-bold uppercase text-white bg-rose-600 p-4 rounded-3xl ${
                  isLoading ? "bg-slate-300" : "hover:bg-sky-600"
                }`}
              >
                <span>Đăng ký</span>
                {isLoading && (
                  <span className="ml-2 loading loading-dots loading-md"></span>
                )}
              </button>
              <h3 className="text-center text-xl font-semibold my-4 divider">
                hoặc
              </h3>
              {/* Google button */}
              <GoogleAuth />
            </div>
          </div>
        </form>
      </div>
    </Container>
  );
};

export default SignUpPage;
