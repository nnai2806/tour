import { useState } from "react";
import { FaPen } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { updateSuccess } from "../../redux/user/userSlice";

const ProfileInfo = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [inputModifies, setInputModifies] = useState({});
  const [formData, setFormData] = useState({});

  const handleFormData = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value.trim() });
  };

  const onUpdate = async () => {
    try {
      const res = await axios.put(
        `/api/user/update/${currentUser._id}`,
        formData
      );
      if (res.status === 200) {
        toast.success("Cập nhật thành công!");
        dispatch(updateSuccess({ ...currentUser, ...formData }));
      }
    } catch (error) {
      toast.error("Lỗi cập nhật!");
    }
  };

  return (
    <div className="border p-4 rounded-md">
      <h1 id="info" className="text-xl font-bold pb-4 border-b-2 text-sky-600">
        Thông tin cá nhân
      </h1>
      <div className="grid md:grid-cols-2 gap-4">
        {/* Fullname */}
        <div>
          <div className="flex items-center justify-between text-xl py-4 border-b">
            <h2 className="font-semibold">Họ và tên</h2>
            <p>{currentUser.fullName || ""}</p>
            <FaPen
              onClick={() =>
                setInputModifies({
                  fullName: !inputModifies.fullName,
                })
              }
              className="text-sky-600 cursor-pointer ml-2"
            />
          </div>
          <div className={`p-2 ${!inputModifies.fullName && "hidden"}`}>
            <input
              onChange={handleFormData}
              name="fullName"
              placeholder="Nhập họ tên mới"
              type="text"
              className="input input-bordered w-full"
            />
            <div className="flex gap-2 justify-end my-2">
              <button
                onClick={() =>
                  setInputModifies({ ...inputModifies, fullName: false })
                }
                className="btn"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onUpdate();
                  setInputModifies({ ...inputModifies, fullName: false });
                }}
                className="btn btn-info"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
        {/* Date of birth */}
        <div>
          <div className="flex items-center justify-between text-xl py-4 border-b">
            <h2 className="font-semibold">Ngày sinh</h2>
            <p>{currentUser.dateOfBirth || ""}</p>
            <FaPen
              onClick={() =>
                setInputModifies({
                  dateOfBirth: !inputModifies.dateOfBirth,
                })
              }
              className="text-sky-600 cursor-pointer ml-2"
            />
          </div>
          <div className={`p-2 ${!inputModifies.dateOfBirth && "hidden"}`}>
            <input
              onChange={handleFormData}
              name="dateOfBirth"
              placeholder="Nhập ngày sinh"
              type="date"
              className="input input-bordered w-full"
            />
            <div className="flex gap-2 justify-end my-2">
              <button onClick={() => setInputModifies({})} className="btn">
                Hủy
              </button>
              <button
                onClick={() => {
                  onUpdate();
                  setInputModifies({});
                }}
                className="btn btn-info"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
        {/* Phone */}
        <div>
          <div className="flex items-center justify-between text-xl py-4 border-b">
            <h2 className="font-semibold">Số điện thoại</h2>
            <p>{currentUser.phone || ""}</p>
            <FaPen
              onClick={() =>
                setInputModifies({
                  phone: !inputModifies.phone,
                })
              }
              className="text-sky-600 cursor-pointer ml-2"
            />
          </div>
          <div className={`p-2 ${!inputModifies.phone && "hidden"}`}>
            <input
              onChange={handleFormData}
              name="phone"
              placeholder="Nhập họ tên mới"
              type="text"
              className="input input-bordered w-full"
            />
            <div className="flex gap-2 justify-end my-2">
              <button onClick={() => setInputModifies({})} className="btn">
                Hủy
              </button>
              <button
                onClick={() => {
                  onUpdate();
                  setInputModifies({});
                }}
                className="btn btn-info"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
        {/* Address */}
        <div>
          <div className="flex items-center justify-between text-xl py-4 border-b">
            <h2 className="font-semibold">Địa chỉ</h2>
            <p>{currentUser.address || ""}</p>
            <FaPen
              onClick={() =>
                setInputModifies({
                  address: !inputModifies.address,
                })
              }
              className="text-sky-600 cursor-pointer ml-2"
            />
          </div>
          <div className={`p-2 ${!inputModifies.address && "hidden"}`}>
            <input
              onChange={handleFormData}
              name="address"
              placeholder="Nhập địa chỉ"
              type="text"
              className="input input-bordered w-full"
            />
            <div className="flex gap-2 justify-end my-2">
              <button onClick={() => setInputModifies({})} className="btn">
                Hủy
              </button>
              <button
                onClick={() => {
                  onUpdate();
                  setInputModifies({});
                }}
                className="btn btn-info"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
        {/* Sex */}
        <div>
          <div className="flex items-center justify-between text-xl py-4 border-b">
            <h2 className="font-semibold">Giới tính</h2>
            <p>{currentUser.sex || ""}</p>
            <FaPen
              onClick={() =>
                setInputModifies({
                  sex: !inputModifies.sex,
                })
              }
              className="text-sky-600 cursor-pointer ml-2"
            />
          </div>
          <div className={`p-2 ${!inputModifies.sex && "hidden"}`}>
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
                  onChange={handleFormData}
                  name="sex"
                  type="radio"
                  value={"Chưa biết"}
                  className="radio"
                />
                Chưa biết
              </label>
            </fieldset>
            <div className="flex gap-2 justify-end my-2">
              <button onClick={() => setInputModifies({})} className="btn">
                Hủy
              </button>
              <button
                onClick={() => {
                  onUpdate();
                  setInputModifies({});
                }}
                className="btn btn-info"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
        {/* CCCD */}
        <div>
          <div className="flex items-center justify-between text-xl py-4 border-b">
            <h2 className="font-semibold">CCCD</h2>
            <p>{currentUser.cccd || ""}</p>
            <FaPen
              onClick={() =>
                setInputModifies({
                  cccd: !inputModifies.cccd,
                })
              }
              className="text-sky-600 cursor-pointer ml-2"
            />
          </div>
          <div className={`p-2 ${!inputModifies.cccd && "hidden"}`}>
            <input
              onChange={handleFormData}
              name="cccd"
              placeholder="Nhập số cccd"
              type="text"
              className="input input-bordered w-full"
            />
            <div className="flex gap-2 justify-end my-2">
              <button onClick={() => setInputModifies({})} className="btn">
                Hủy
              </button>
              <button
                onClick={() => {
                  onUpdate();
                  setInputModifies({});
                }}
                className="btn btn-info"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
