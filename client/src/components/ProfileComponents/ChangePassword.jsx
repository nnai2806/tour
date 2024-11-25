import axios from "axios";
import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaKey } from "react-icons/fa";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ChangePassword = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState([]);
  // const [isGoogleAuth, setGoogleAuth] = useState(false);

  // States manage input's errors
  const [passwordError, setPasswordError] = useState("");
  const [rePasswordError, setRePasswordError] = useState("");

  useEffect(() => {
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

  const handleFormData = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value.trim() });
  };

  const onChangePass = async () => {
    if (!formData.password) {
      setPasswordError("Vui lòng nhập mật khẩu!");
      return;
    } else if (formData.password && formData.password.length < 6) {
      setPasswordError("Mật khẩu tối thiểu 6 ký tự!");
      return;
    } else if (formData.rePassword !== formData.password) {
      setRePasswordError("Mật khẩu không khớp!");
      return;
    }
    try {
      const res = await axios.put(
        `/api/user/update/${currentUser._id}`,
        formData
      );
      if (res.status === 200) {
        toast.success("Đổi mật khẩu thành công!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="border p-4 rounded-md">
      <h1 className="text-xl font-bold pb-4 border-b-2 text-sky-600">
        Đổi mật khẩu
      </h1>
      {/* <div className="flex items-center gap-4 mt-4 -mb-4">
        <p>Đăng nhập bằng Google</p>
        <input
          onChange={() => {
            setGoogleAuth(!isGoogleAuth);
          }}
          type="checkbox"
          className="checkbox"
        />
      </div> */}
      <div className="grid md:grid-cols-2 gap-4 py-4">
        {/* OldPassword input */}
        {/* {!isGoogleAuth && (
          <label className="form-control w-full mt-4">
            <div className="label p-0 py-2">
              <span className="label-text font-bold text-xl">
                Mật khẩu cũ <span className="text-rose-500">*</span>
              </span>
            </div>
            <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
              <FaKey className="text-xl text-slate-500" />
              <input
                onChange={handleFormData}
                name="rePassword"
                type={showPassword ? "text" : "password"}
                className="grow"
                placeholder="Nhập mật khẩu cũ..."
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
          </label>
        )} */}
        {/* NewPassword input */}
        <label className="form-control w-full mt-4">
          <div className="label p-0 py-2">
            <span className="label-text font-bold text-xl">
              Mật khẩu mới <span className="text-rose-500">*</span>
            </span>
          </div>
          <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
            <FaKey className="text-xl text-slate-500" />
            <input
              onChange={handleFormData}
              name="password"
              type={showPassword ? "text" : "password"}
              className="grow"
              placeholder="Nhập mật khẩu mới..."
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
        {/* ReNewPassword input */}
        <label className="form-control w-full mt-4">
          <div className="label p-0 py-2">
            <span className="label-text font-bold text-xl">
              Nhập lại mật khẩu mới <span className="text-rose-500">*</span>
            </span>
          </div>
          <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
            <FaKey className="text-xl text-slate-500" />
            <input
              onChange={handleFormData}
              name="rePassword"
              type={showPassword ? "text" : "password"}
              className="grow"
              placeholder="Nhập lại mật khẩu mới..."
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
          {rePasswordError && (
            <span className="text-rose-500 italic mt-1">{rePasswordError}</span>
          )}
        </label>
        {/* Button change password */}
        <div className="flex items-end">
          <button onClick={onChangePass} className="btn btn-info">
            Đổi mật khẩu
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
