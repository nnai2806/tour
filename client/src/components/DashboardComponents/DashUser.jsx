import { useEffect, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import AvatarDefault from "../../assets/images/avatar.png";
import axios from "axios";
import {
  FaBirthdayCake,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaIdCard,
  FaKey,
  FaPen,
  FaPhone,
  FaQuestionCircle,
  FaSearch,
  FaUser,
} from "react-icons/fa";
import { MdEmail, MdError, MdPlace } from "react-icons/md";
import {
  validateEmail,
  validateIdentifierCard,
  validatePhoneNumber,
} from "../../utils/validate";
import moment from "moment";
import { useDebounce } from "use-debounce";

const DashUser = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [listSelected, setListSelected] = useState([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [userDetail, setUserDetail] = useState(null);
  const [inputModifies, setInputModifies] = useState({});
  const [formDataToUpdate, setFormDataToUpdate] = useState({});
  const [formDataToAdd, setFormDataToAdd] = useState({});
  const [successToast, setSuccessToast] = useState("");
  const [errorToast, setErrorToast] = useState("");
  const [searchText, setSearchText] = useState("");
  const [valueSearch] = useDebounce(searchText, 500);

  // States manage input's errors
  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [rePasswordError, setRePasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  // ==============================================
  // Method call API
  const fetchUsers = async (page = 0, valueSearch) => {
    const res = await axios.get(
      `/api/user/get?page=${page}&search=${valueSearch}`
    );
    return res.data;
  };

  const addUser = async (formDataToUpdate) => {
    const res = await axios.post("/api/auth/signup", formDataToUpdate);
    return res.data;
  };

  const updateUser = async (formDataToUpdate) => {
    const res = await axios.put(
      `/api/user/update/${userDetail._id}`,
      formDataToUpdate
    );
    return res.data;
  };

  const deleteUser = async (id) => {
    await axios.delete(`/api/user/delete/${id}`);
  };

  const deleteManyUser = async (listId) => {
    await axios.delete("/api/user/delete", {
      data: { userIds: listId },
    });
  };
  // ==============================================
  // Hanlde mutation
  const mutationAdd = useMutation({
    mutationFn: addUser,
    onSuccess: () => {
      setSuccessToast("Thêm thành công!");
      queryClient.invalidateQueries("users");
    },
    onError: (error) => {
      const { message } = error.response.data;
      if (message) {
        if (message.includes("E11000")) {
          setErrorToast("Tài khoản đã tồn tại!");
        } else {
          setErrorToast(message);
        }
      }
    },
  });

  const mutationUpdate = useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries("users");
      setUserDetail(data);
      setSuccessToast("Cập nhật thành công!");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const mutationDelete = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries("users");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const mutationDeleteMany = useMutation({
    mutationFn: deleteManyUser,
    onSuccess: () => {
      queryClient.invalidateQueries("users");
      setSelectedAll(false);
      setListSelected([]);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  // Fetch data
  const { isPending, data } = useQuery({
    queryKey: ["users", page, valueSearch],
    queryFn: () => fetchUsers(page, valueSearch),
    placeholderData: keepPreviousData,
  });
  // ====================================================
  // Handle toast messages
  useEffect(() => {
    if (successToast) {
      setTimeout(() => {
        setSuccessToast("");
      }, [2000]);
    }
    if (errorToast) {
      setTimeout(() => {
        setErrorToast("");
      }, [2000]);
    }
  }, [errorToast, successToast]);

  useEffect(() => {
    // Validate fullName input
    if (formDataToAdd.fullName === "") {
      setFullNameError("Vui lòng nhập họ tên!");
    } else {
      setFullNameError("");
    }

    // Validate email input
    if (formDataToAdd.email) {
      if (!validateEmail(formDataToAdd.email)) {
        setEmailError("Email không đúng định dạng!");
      } else {
        setEmailError("");
      }
    } else {
      if (formDataToAdd.email !== undefined) {
        setEmailError("Vui lòng nhập email!");
      }
    }

    // Validate password
    if (formDataToAdd.password) {
      if (formDataToAdd.password === "") {
        setPasswordError("Vui lòng nhập mật khẩu!");
      } else {
        if (formDataToAdd.password.length < 6) {
          setPasswordError("Mật khẩu tối thiểu 6 ký tự!");
        } else {
          setPasswordError("");
        }
      }
    }

    // Validate re-password
    if (formDataToAdd.rePassword !== formDataToAdd.password) {
      setRePasswordError("Mật khẩu không khớp!");
    } else {
      setRePasswordError("");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formDataToAdd]);

  const onUpdate = async () => {
    mutationUpdate.mutate(formDataToUpdate);
  };

  const handleDelete = () => {
    mutationDelete.mutate(userDetail._id);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formDataToAdd.fullName) {
      setFullNameError("Vui lòng nhập họ tên!");
      return;
    } else if (!formDataToAdd.email) {
      setEmailError("Vui lòng nhập email!");
      return;
    } else if (!validateEmail(formDataToAdd.email)) {
      setEmailError("Email không đúng định dạng!");
      return;
    } else if (!formDataToAdd.password) {
      setPasswordError("Vui lòng nhập mật khẩu!");
      return;
    } else if (formDataToAdd.password && formDataToAdd.password.length < 6) {
      setPasswordError("Mật khẩu tối thiểu 6 ký tự!");
      return;
    } else if (formDataToAdd.rePassword !== formDataToAdd.password) {
      setRePasswordError("Mật khẩu không khớp!");
      return;
    }
    mutationAdd.mutate(formDataToAdd);
  };

  const handleDeleteMany = () => {
    mutationDeleteMany.mutate(listSelected);
  };

  const toggleSelectAll = () => {
    setSelectedAll(!selectedAll);
    if (!selectedAll) {
      setListSelected(data?.users.map((item) => item._id));
    } else {
      setListSelected([]);
    }
  };

  const toggleSelectSingle = (id) => {
    setSelectedAll(false);
    if (listSelected.includes(id)) {
      setListSelected(listSelected.filter((item) => item !== id));
    } else {
      setListSelected([...listSelected, id]);
    }
  };

  const handleNextPage = () => {
    setSelectedAll(false);
    setListSelected([]);
    if (page === Math.ceil(data?.totalUsers / 9) - 1) {
      return;
    }
    setPage(page + 1);
  };

  const handlePreviousPage = () => {
    setSelectedAll(false);
    setListSelected([]);
    if (page === 0) {
      return;
    }
    setPage(page - 1);
  };

  const handleShowDetailModal = (user) => {
    setFormDataToUpdate({});
    setInputModifies({});
    setUserDetail(user);
    document.getElementById("modal-details-user").showModal();
  };

  const handleShowModifyModal = (user) => {
    setFormDataToUpdate({});
    setInputModifies({});
    setUserDetail(user);
    document.getElementById("modal-modify-user").showModal();
  };

  const handleShowDeleteModal = (user) => {
    setUserDetail(user);
    document.getElementById("modal-delete-user").showModal();
  };

  const handleShowAddModal = () => {
    document.getElementById("modal-add-user").showModal();
  };

  const handleShowDeleteManyModal = () => {
    document.getElementById("modal-deleteMany-user").showModal();
  };

  const handleFormDataToUpdate = (e) => {
    setFormDataToUpdate({
      ...formDataToUpdate,
      [e.target.name]: e.target.value.trim(),
    });
  };

  const handleFormDataToAdd = (e) => {
    setFormDataToAdd({
      ...formDataToAdd,
      [e.target.name]: e.target.value.trim(),
    });
  };

  return (
    <div>
      <label className="input input-bordered flex items-center gap-2 md:hidden mb-4">
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          type="text"
          className="grow"
          placeholder="Tìm kiếm"
        />
        <FaSearch />
      </label>
      <div className="border p-4 rounded-md">
        <h1 className="text-xl font-bold pb-4 border-b-2 text-sky-600 flex justify-between items-center">
          Quản lý người dùng
          <label className="input input-bordered md:flex items-center gap-2 hidden">
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              type="text"
              className="grow"
              placeholder="Tìm kiếm"
            />
            <FaSearch />
          </label>
          <button onClick={handleShowAddModal} className="btn btn-info">
            Thêm
          </button>
        </h1>
        <div className="overflow-x-auto">
          {isPending ? (
            <div className="flex w-full flex-col gap-4 my-4">
              <div className="skeleton h-16 w-full"></div>
              <div className="skeleton h-16 w-full"></div>
              <div className="skeleton h-16 w-full"></div>
              <div className="skeleton h-16 w-full"></div>
              <div className="skeleton h-16 w-full"></div>
              <div className="skeleton h-16 w-full"></div>
            </div>
          ) : (
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th>
                    <label>
                      <input
                        checked={selectedAll}
                        onChange={toggleSelectAll}
                        type="checkbox"
                        className="checkbox"
                      />
                    </label>
                  </th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  {listSelected.length !== 0 && (
                    <th className="flex justify-center items-center">
                      <button
                        onClick={handleShowDeleteManyModal}
                        className="btn btn-ghost btn-sm text-rose-500 border border-black"
                      >
                        Xóa {listSelected.length} đã chọn
                      </button>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {/* row 1 */}
                {data.users.length !== 0 ? (
                  data.users.map((user) => (
                    <tr key={user._id}>
                      <th>
                        <label>
                          <input
                            checked={listSelected.includes(user._id)}
                            onChange={() => toggleSelectSingle(user._id)}
                            type="checkbox"
                            className="checkbox"
                          />
                        </label>
                      </th>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="mask mask-squircle h-12 w-12">
                              <img
                                src={user.image || AvatarDefault}
                                alt="Avatar Tailwind CSS Component"
                              />
                            </div>
                          </div>
                          <div className="font-bold">{user.fullName}</div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        {user.phone || (
                          <span className="italic text-sm">Chưa cập nhật</span>
                        )}
                      </td>
                      <th className="pr-0">
                        <div className="flex gap-2 flex-wrap items-center justify-end">
                          <button
                            onClick={() => handleShowDetailModal(user)}
                            className="text-nowrap btn btn-ghost md:btn-xs border border-black"
                          >
                            Chi tiết
                          </button>
                          <button
                            onClick={() => handleShowModifyModal(user)}
                            className="text-nowrap btn btn-ghost md:btn-xs border border-black"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleShowDeleteModal(user)}
                            className="text-nowrap btn btn-ghost md:btn-xs text-rose-500 border border-red-500"
                          >
                            Xóa
                          </button>
                        </div>
                      </th>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center text-slate-400 text-xl p-10"
                    >
                      Dữ liệu rỗng
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {/* Pagination */}
        {data?.users.length !== 0 && (
          <div className="join mt-4 flex justify-center">
            <button
              onClick={handlePreviousPage}
              className={`join-item btn ${page === 0 && "btn-disabled"}`}
            >
              «
            </button>
            <button className="join-item btn">
              Trang {page + 1} / {Math.ceil(data?.totalUsers / 9)}
            </button>
            <button
              onClick={handleNextPage}
              className={`join-item btn ${
                page === Math.ceil(data?.totalUsers / 9) - 1 && "btn-disabled"
              }`}
            >
              »
            </button>
          </div>
        )}
        {/* Modal details */}
        <dialog id="modal-details-user" className="modal">
          <div className="modal-box">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg">Thông tin người dùng</h3>
            <div className="my-4">
              <div className="flex flex-col items-center">
                {/* Avatar */}
                <div className="avatar cursor-pointer hover:brightness-75">
                  <div className="w-32 border-2 rounded-md shadow-md hover:border-sky-600">
                    <img
                      src={userDetail?.image || AvatarDefault}
                      alt="avatar"
                    />
                  </div>
                </div>
                {/* Name and email */}
                <h1 className="text-xl font-bold my-2 text-sky-600">
                  {userDetail?.fullName}
                </h1>
                <h3 className="italic mb-2">{userDetail?.email}</h3>
                {/* More info */}
                <div className="text-xl">
                  <h3>
                    <strong>Cccd: </strong>
                    {userDetail?.cccd || "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Ngày sinh: </strong>
                    {userDetail?.dateOfBirth || "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Giới tính: </strong>
                    {userDetail?.sex || "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Số điện thoại: </strong>
                    {userDetail?.phone || "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Địa chỉ: </strong>
                    {userDetail?.address || "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Ngày tạo: </strong>
                    {moment(userDetail?.createdAt).format(
                      "DD/MM/YYYY HH:mm:ss"
                    ) || "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Chỉnh sửa lúc: </strong>
                    {moment(userDetail?.updatedAt).format(
                      "DD/MM/YYYY HH:mm:ss"
                    ) || "Chưa cập nhật"}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </dialog>
        {/* Modal modify */}
        <dialog id="modal-modify-user" className="modal">
          <div className="modal-box">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg">Cập nhật thông tin</h3>
            {successToast && (
              <div className="alert alert-success text-white my-2 animate-pulse">
                <FaCheckCircle className="text-xl" />
                <span className="text-xl">{successToast}</span>
              </div>
            )}
            {errorToast && (
              <div className="alert alert-error text-white my-2 animate-pulse">
                <MdError className="text-xl" />
                <span className="text-xl">{errorToast}</span>
              </div>
            )}
            <div className="my-4">
              <div className="">
                {/* Fullname */}
                <div>
                  <div className="flex text-xl py-4 border-b">
                    <h2 className="font-semibold flex-1">Họ và tên</h2>
                    <p className="flex-1">{userDetail?.fullName || ""}</p>
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
                      onChange={handleFormDataToUpdate}
                      name="fullName"
                      placeholder="Nhập họ tên mới"
                      type="text"
                      className="input input-bordered w-full"
                    />
                    <div className="flex gap-2 justify-end my-2">
                      <button
                        onClick={() =>
                          setInputModifies({
                            ...inputModifies,
                            fullName: false,
                          })
                        }
                        className="btn"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => {
                          onUpdate();
                          setInputModifies({
                            ...inputModifies,
                            fullName: false,
                          });
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
                    <h2 className="font-semibold flex-1">Ngày sinh</h2>
                    <p className="flex-1">{userDetail?.dateOfBirth || ""}</p>
                    <FaPen
                      onClick={() =>
                        setInputModifies({
                          dateOfBirth: !inputModifies.dateOfBirth,
                        })
                      }
                      className="text-sky-600 cursor-pointer ml-2"
                    />
                  </div>
                  <div
                    className={`p-2 ${!inputModifies.dateOfBirth && "hidden"}`}
                  >
                    <input
                      onChange={handleFormDataToUpdate}
                      name="dateOfBirth"
                      placeholder="Nhập ngày sinh"
                      type="date"
                      className="input input-bordered w-full"
                    />
                    <div className="flex gap-2 justify-end my-2">
                      <button
                        onClick={() => setInputModifies({})}
                        className="btn"
                      >
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
                    <h2 className="font-semibold flex-1">Số điện thoại</h2>
                    <p className="flex-1">{userDetail?.phone || ""}</p>
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
                      onChange={handleFormDataToUpdate}
                      name="phone"
                      placeholder="Nhập họ tên mới"
                      type="text"
                      className="input input-bordered w-full"
                    />
                    <div className="flex gap-2 justify-end my-2">
                      <button
                        onClick={() => setInputModifies({})}
                        className="btn"
                      >
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
                    <h2 className="font-semibold flex-1">Địa chỉ</h2>
                    <p className="flex-1">{userDetail?.address || ""}</p>
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
                      onChange={handleFormDataToUpdate}
                      name="address"
                      placeholder="Nhập địa chỉ"
                      type="text"
                      className="input input-bordered w-full"
                    />
                    <div className="flex gap-2 justify-end my-2">
                      <button
                        onClick={() => setInputModifies({})}
                        className="btn"
                      >
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
                    <h2 className="font-semibold flex-1">Giới tính</h2>
                    <p className="flex-1">{userDetail?.sex || ""}</p>
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
                          onChange={handleFormDataToUpdate}
                          name="sex"
                          type="radio"
                          value={"Nam"}
                          className="radio"
                        />
                        Nam
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          onChange={handleFormDataToUpdate}
                          name="sex"
                          type="radio"
                          value={"Nữ"}
                          className="radio"
                        />
                        Nữ
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          onChange={handleFormDataToUpdate}
                          name="sex"
                          type="radio"
                          value={"Chưa biết"}
                          className="radio"
                        />
                        Chưa biết
                      </label>
                    </fieldset>
                    <div className="flex gap-2 justify-end my-2">
                      <button
                        onClick={() => setInputModifies({})}
                        className="btn"
                      >
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
                    <h2 className="font-semibold flex-1">CCCD</h2>
                    <p className="flex-1">{userDetail?.cccd || ""}</p>
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
                      onChange={handleFormDataToUpdate}
                      name="cccd"
                      placeholder="Nhập số cccd"
                      type="text"
                      className="input input-bordered w-full"
                    />
                    <div className="flex gap-2 justify-end my-2">
                      <button
                        onClick={() => setInputModifies({})}
                        className="btn"
                      >
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
          </div>
        </dialog>
        {/* Modal delete */}
        <dialog id="modal-delete-user" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Xóa người dùng</h3>
            <div className="flex flex-col items-center gap-4 my-4">
              <FaQuestionCircle className="text-4xl text-slate-500" />
              <p className="text-xl text-slate-500">
                Bạn có chắc muốn xóa mục này?
              </p>
            </div>
            <div className="modal-action">
              <form method="dialog">
                <div className="flex gap-8">
                  <button className="btn">Hủy</button>
                  <button onClick={handleDelete} className="btn btn-error">
                    Xóa
                  </button>
                </div>
              </form>
            </div>
          </div>
        </dialog>
        {/* Modal add */}
        <dialog id="modal-add-user" className="modal">
          <div className="modal-box">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg">Thêm người dùng</h3>
            {successToast && (
              <div className="alert alert-success text-white my-2 animate-pulse">
                <FaCheckCircle className="text-xl" />
                <span className="text-xl">{successToast}</span>
              </div>
            )}
            {errorToast && (
              <div className="alert alert-error text-white my-2 animate-pulse">
                <MdError className="text-xl" />
                <span className="text-xl">{errorToast}</span>
              </div>
            )}
            <form onSubmit={handleAdd} className="my-4">
              <div>
                {/* Fullname input */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Họ tên <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <FaUser className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
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
                    <span className="label-text font-bold ">
                      Email <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <MdEmail className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
                      name="email"
                      type="text"
                      className="grow"
                      placeholder="Nhập email..."
                    />
                  </label>
                  {emailError && (
                    <span className="text-rose-500 italic mt-1">
                      {emailError}
                    </span>
                  )}
                </label>

                {/* Password input */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Mật khẩu <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <FaKey className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className="grow"
                      placeholder="Nhập mật khẩu..."
                    />
                    {showPassword ? (
                      <FaEye
                        onClick={() => setShowPassword(false)}
                        className=" text-slate-500 cursor-pointer"
                      />
                    ) : (
                      <FaEyeSlash
                        onClick={() => setShowPassword(true)}
                        className=" text-slate-500 cursor-pointer"
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
                    <span className="label-text font-bold ">Ngày sinh</span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <FaBirthdayCake className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
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
                    <span className="label-text font-bold ">
                      Nhập lại mật khẩu <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <FaKey className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
                      name="rePassword"
                      type={showRePassword ? "text" : "password"}
                      className="grow"
                      placeholder="Nhập lại mật khẩu..."
                    />
                    {showRePassword ? (
                      <FaEye
                        onClick={() => setShowRePassword(false)}
                        className=" text-slate-500 cursor-pointer"
                      />
                    ) : (
                      <FaEyeSlash
                        onClick={() => setShowRePassword(true)}
                        className=" text-slate-500 cursor-pointer"
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
                    <span className="label-text font-bold ">Giới tính</span>
                  </div>
                  <fieldset className="flex items-center gap-8">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        onChange={handleFormDataToAdd}
                        name="sex"
                        type="radio"
                        value={"Nam"}
                        className="radio"
                      />
                      Nam
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        onChange={handleFormDataToAdd}
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
                        onChange={handleFormDataToAdd}
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
                    <span className="label-text font-bold ">Số điện thoại</span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <FaPhone className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
                      name="phone"
                      type="text"
                      className="grow"
                      placeholder="Nhập số điện thoại..."
                    />
                  </label>
                  {formDataToAdd.phone !== undefined &&
                    !validatePhoneNumber(formDataToAdd.phone) && (
                      <span className="text-rose-500 italic mt-1">
                        Số điện thoại không đúng định dạng!
                      </span>
                    )}
                </label>

                {/* Cccd input */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">CCCD</span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <FaIdCard className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
                      name="cccd"
                      type="text"
                      className="grow"
                      placeholder="Nhập cccd..."
                    />
                  </label>
                  {formDataToAdd.cccd !== undefined &&
                    !validateIdentifierCard(formDataToAdd.cccd) && (
                      <span className="text-rose-500 italic mt-1">
                        Không đúng định dạng!
                      </span>
                    )}
                </label>

                {/* Address input */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">Địa chỉ</span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <MdPlace className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
                      name="address"
                      type="text"
                      className="grow"
                      placeholder="Nhập địa chỉ..."
                    />
                  </label>
                </label>
              </div>
              <div className="flex justify-center w-full mt-10">
                <div className="w-full md:w-1/2">
                  {/* Login button */}
                  <button
                    type="submit"
                    // disabled={isLoading}
                    className={
                      `flex justify-center items-center w-full text-xl font-bold uppercase text-white bg-rose-600 p-4 rounded-3xl`
                      // ${isLoading ? "bg-slate-300" : "hover:bg-sky-600"}`
                    }
                  >
                    <span>Thêm</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </dialog>
        {/* Modal delete many */}
        <dialog id="modal-deleteMany-user" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Xóa người dùng</h3>
            <div className="flex flex-col items-center gap-4 my-4">
              <FaQuestionCircle className="text-4xl text-slate-500" />
              <p className="text-xl text-slate-500">
                Bạn có chắc muốn xóa các mục này?
              </p>
            </div>
            <div className="modal-action">
              <form method="dialog">
                <div className="flex gap-8">
                  <button className="btn">Hủy</button>
                  <button onClick={handleDeleteMany} className="btn btn-error">
                    Xóa đã chọn
                  </button>
                </div>
              </form>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  );
};

export default DashUser;
