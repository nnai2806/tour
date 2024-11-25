import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import { GoNumber } from "react-icons/go";
import {
  FaCheckCircle,
  FaMoneyBillWave,
  FaPen,
  FaQrcode,
  FaQuestionCircle,
  FaSearch,
} from "react-icons/fa";
import {
  MdCategory,
  MdDateRange,
  MdDescription,
  MdError,
  MdTitle,
} from "react-icons/md";
import { useDebounce } from "use-debounce";

const DashCoupon = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [listSelected, setListSelected] = useState([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [inputModifies, setInputModifies] = useState({});
  const [formDataToUpdate, setFormDataToUpdate] = useState({});
  const [formDataToAdd, setFormDataToAdd] = useState({});
  const [successToast, setSuccessToast] = useState("");
  const [errorToast, setErrorToast] = useState("");
  const [searchText, setSearchText] = useState("");
  const [valueSearch] = useDebounce(searchText, 500);

  // States manage input's errors
  const [nameError, setNameError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [typeError, setTypeError] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [discountAmountError, setDiscountAmountError] = useState("");
  const [usageLimitError, setUsageLimitError] = useState("");

  // ==============================================
  // Method call API
  const fetchCoupons = async (page = 0, valueSearch) => {
    const res = await axios.get(
      `/api/coupon/get?page=${page}&search=${valueSearch}`
    );
    return res.data;
  };

  const addCoupon = async (formDataToUpdate) => {
    const res = await axios.post("/api/coupon/create", formDataToUpdate);
    return res.data;
  };

  const updateCoupon = async (formDataToUpdate) => {
    const res = await axios.put(
      `/api/coupon/update/${coupon._id}`,
      formDataToUpdate
    );
    return res.data;
  };

  const deleteCoupon = async (id) => {
    await axios.delete(`/api/coupon/delete/${id}`);
  };

  const deleteManyCoupon = async (listId) => {
    await axios.delete("/api/coupon/delete", {
      data: { couponIds: listId },
    });
  };
  // ==============================================
  // Hanlde mutation
  const mutationAdd = useMutation({
    mutationFn: addCoupon,
    onSuccess: () => {
      setSuccessToast("Thêm thành công!");
      queryClient.invalidateQueries("coupons");
    },
    onError: (error) => {
      const { message } = error.response.data;
      if (message) {
        if (message.includes("E11000")) {
          setErrorToast("Dữ liệu đã tồn tại!");
        } else {
          setErrorToast(message);
        }
      }
    },
  });

  const mutationUpdate = useMutation({
    mutationFn: updateCoupon,
    onSuccess: (data) => {
      queryClient.invalidateQueries("coupons");
      setCoupon(data);
      setSuccessToast("Cập nhật thành công!");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const mutationDelete = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries("coupons");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const mutationDeleteMany = useMutation({
    mutationFn: deleteManyCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries("coupons");
      setSelectedAll(false);
      setListSelected([]);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  // Fetch data
  const { isPending, data } = useQuery({
    queryKey: ["coupons", page, valueSearch],
    queryFn: () => fetchCoupons(page, valueSearch),
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

  // Validate on time
  useEffect(() => {
    // Validate name
    if (formDataToAdd.name !== undefined) {
      if (!formDataToAdd.name) {
        setNameError("Vui lòng nhập trường này!");
      } else {
        setNameError("");
      }
    } else {
      setNameError("");
    }
    // Validate code
    if (formDataToAdd.code !== undefined) {
      if (!formDataToAdd.code) {
        setCodeError("Vui lòng nhập trường này!");
      } else {
        setCodeError("");
      }
    } else {
      setCodeError("");
    }
    // Validate discount amount
    if (formDataToAdd.discountAmout !== undefined) {
      if (!formDataToAdd.discountAmout) {
        setDiscountAmountError("Vui lòng nhập trường này!");
      } else {
        setDiscountAmountError("");
      }
    } else {
      setDiscountAmountError("");
    }
    // Validate type
    if (formDataToAdd.type !== undefined) {
      if (!formDataToAdd.type) {
        setTypeError("Vui lòng nhập trường này!");
      } else if (formDataToAdd.type !== "pt" && formDataToAdd.type !== "t") {
        setTypeError("Thể loại là 'pt' hoặc 't'!");
      } else {
        setTypeError("");
      }
    } else {
      setTypeError("");
    }
    // Validate startDate
    if (formDataToAdd.startDate !== undefined) {
      if (!formDataToAdd.startDate) {
        setStartDateError("Vui lòng nhập trường này!");
      } else {
        setStartDateError("");
      }
    } else {
      setStartDateError("");
    }
    // Validate endDate
    if (formDataToAdd.endDate !== undefined) {
      if (!formDataToAdd.endDate) {
        setEndDateError("Vui lòng nhập trường này!");
      } else {
        setEndDateError("");
      }
    } else {
      setEndDateError("");
    }
    // Validate usageLimit
    if (formDataToAdd.usageLimit !== undefined) {
      if (!formDataToAdd.usageLimit) {
        setUsageLimitError("Vui lòng nhập trường này!");
      } else {
        setUsageLimitError("");
      }
    } else {
      setUsageLimitError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formDataToAdd]);

  const onUpdate = async () => {
    mutationUpdate.mutate(formDataToUpdate);
  };

  const handleDelete = () => {
    mutationDelete.mutate(coupon._id);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formDataToAdd.name) {
      setNameError("Vui lòng nhập trường này!");
      return;
    } else if (!formDataToAdd.code) {
      setCodeError("Vui lòng nhập trường này!");
      return;
    } else if (!formDataToAdd.discountAmout) {
      setDiscountAmountError("Vui lòng nhập trường này!");
      return;
    } else if (!formDataToAdd.type) {
      setTypeError("Vui lòng nhập trường này!");
      return;
    } else if (formDataToAdd.type !== "pt" && formDataToAdd.type !== "t") {
      setTypeError("Thể loại là 'pt' hoặc 't'!");
      return;
    } else if (!formDataToAdd.startDate) {
      setStartDateError("Vui lòng nhập trường này!");
      return;
    } else if (!formDataToAdd.endDate) {
      setEndDateError("Vui lòng nhập trường này!");
      return;
    } else if (!formDataToAdd.usageLimit) {
      setUsageLimitError("Vui lòng nhập trường này!");
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
      setListSelected(data?.coupons.map((item) => item._id));
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
    if (page === Math.ceil(data?.totalCoupons / 9) - 1) {
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

  const handleShowDetailModal = (coupon) => {
    setFormDataToUpdate({});
    setInputModifies({});
    setCoupon(coupon);
    document.getElementById("modal-details-coupon").showModal();
  };

  const handleShowModifyModal = (coupon) => {
    setFormDataToUpdate({});
    setInputModifies({});
    setCoupon(coupon);
    document.getElementById("modal-modify-coupon").showModal();
  };

  const handleShowDeleteModal = (coupon) => {
    setCoupon(coupon);
    document.getElementById("modal-delete-coupon").showModal();
  };

  const handleShowAddModal = () => {
    document.getElementById("modal-add-coupon").showModal();
  };

  const handleShowDeleteManyModal = () => {
    document.getElementById("modal-deleteMany-coupon").showModal();
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
          Quản lý giá dịch vụ
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
                  <th>Tiêu đề</th>
                  <th>Loại</th>
                  <th>Số lượng</th>
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
                {data.coupons.length !== 0 ? (
                  data.coupons.map((coupon) => (
                    <tr key={coupon._id}>
                      <th>
                        <label>
                          <input
                            checked={listSelected.includes(coupon._id)}
                            onChange={() => toggleSelectSingle(coupon._id)}
                            type="checkbox"
                            className="checkbox"
                          />
                        </label>
                      </th>
                      <td>
                        {coupon.name || (
                          <span className="italic text-sm">Chưa cập nhật</span>
                        )}
                      </td>
                      <td>
                        {coupon.type || (
                          <span className="italic text-sm">Chưa cập nhật</span>
                        )}
                      </td>
                      <td>
                        {coupon.usageLimit || (
                          <span className="italic text-sm">Chưa cập nhật</span>
                        )}
                      </td>
                      <th className="pr-0">
                        <div className="flex gap-2 flex-wrap items-center justify-end">
                          <button
                            onClick={() => handleShowDetailModal(coupon)}
                            className="text-nowrap btn btn-ghost md:btn-xs border border-black"
                          >
                            Chi tiết
                          </button>
                          <button
                            onClick={() => handleShowModifyModal(coupon)}
                            className="text-nowrap btn btn-ghost md:btn-xs border border-black"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleShowDeleteModal(coupon)}
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
        {data?.coupons.length !== 0 && (
          <div className="join mt-4 flex justify-center">
            <button
              onClick={handlePreviousPage}
              className={`join-item btn ${page === 0 && "btn-disabled"}`}
            >
              «
            </button>
            <button className="join-item btn">
              Trang {page + 1} / {Math.ceil(data?.totalCoupons / 9)}
            </button>
            <button
              onClick={handleNextPage}
              className={`join-item btn ${
                page === Math.ceil(data?.totalCoupons / 9) - 1 && "btn-disabled"
              }`}
            >
              »
            </button>
          </div>
        )}
        {/* Modal details */}
        <dialog id="modal-details-coupon" className="modal">
          <div className="modal-box">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg">Thông tin dữ liệu</h3>
            <div className="my-4">
              <div className="flex flex-col items-center">
                {/* More info */}
                <div className="text-xl">
                  <h3>
                    <strong>Tiêu đề: </strong>
                    {coupon?.name || "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Mã: </strong>
                    {coupon?.code || "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Giảm giá: </strong>
                    {coupon?.type === "pt"
                      ? coupon?.discountAmout + " %"
                      : coupon?.discountAmout + " VNĐ" || "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Ngày bắt đầu: </strong>
                    {moment(coupon?.startDate).format("DD/MM/yyyy") ||
                      "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Ngày kết thúc: </strong>
                    {moment(coupon?.endDate).format("DD/MM/yyyy") ||
                      "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Loại: </strong>
                    {coupon?.type === "pt" ? "%" : "VNĐ" || "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Số lượng: </strong>
                    {coupon?.usageLimit || "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Mô tả: </strong>
                    {coupon?.description || "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Ngày tạo: </strong>
                    {moment(coupon?.createdAt).format("DD/MM/YYYY HH:mm:ss") ||
                      "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Chỉnh sửa lúc: </strong>
                    {moment(coupon?.updatedAt).format("DD/MM/YYYY HH:mm:ss") ||
                      "Chưa cập nhật"}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </dialog>
        {/* Modal modify */}
        <dialog id="modal-modify-coupon" className="modal">
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
                {/* Name */}
                <div>
                  <div className="flex text-xl py-4 border-b">
                    <h2 className="font-semibold flex-1">Tiêu đề</h2>
                    <p className="flex-1">{coupon?.name || ""}</p>
                    <FaPen
                      onClick={() =>
                        setInputModifies({
                          name: !inputModifies.name,
                        })
                      }
                      className="text-sky-600 cursor-pointer ml-2"
                    />
                  </div>
                  <div className={`p-2 ${!inputModifies.name && "hidden"}`}>
                    <input
                      onChange={handleFormDataToUpdate}
                      name="name"
                      placeholder="Nhập dữ liệu..."
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
                {/* Code */}
                <div>
                  <div className="flex text-xl py-4 border-b">
                    <h2 className="font-semibold flex-1">Mã</h2>
                    <p className="flex-1">{coupon?.code || ""}</p>
                    <FaPen
                      onClick={() =>
                        setInputModifies({
                          code: !inputModifies.code,
                        })
                      }
                      className="text-sky-600 cursor-pointer ml-2"
                    />
                  </div>
                  <div className={`p-2 ${!inputModifies.code && "hidden"}`}>
                    <input
                      onChange={handleFormDataToUpdate}
                      name="code"
                      placeholder="Nhập dữ liệu..."
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
                {/* Code */}
                <div>
                  <div className="flex text-xl py-4 border-b">
                    <h2 className="font-semibold flex-1">Giảm giá</h2>
                    <p className="flex-1">{coupon?.discountAmout || ""}</p>
                    <FaPen
                      onClick={() =>
                        setInputModifies({
                          discountAmout: !inputModifies.discountAmout,
                        })
                      }
                      className="text-sky-600 cursor-pointer ml-2"
                    />
                  </div>
                  <div
                    className={`p-2 ${
                      !inputModifies.discountAmout && "hidden"
                    }`}
                  >
                    <input
                      onChange={handleFormDataToUpdate}
                      name="discountAmout"
                      placeholder="Nhập dữ liệu..."
                      type="number"
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
                {/* Type */}
                <div>
                  <div className="flex text-xl py-4 border-b">
                    <h2 className="font-semibold flex-1">
                      Thể loại (pt/t: Phần trăm hoặc tiền)
                    </h2>
                    <p className="flex-1">{coupon?.type || ""}</p>
                    <FaPen
                      onClick={() =>
                        setInputModifies({
                          type: !inputModifies.type,
                        })
                      }
                      className="text-sky-600 cursor-pointer ml-2"
                    />
                  </div>
                  <div className={`p-2 ${!inputModifies.type && "hidden"}`}>
                    <input
                      onChange={handleFormDataToUpdate}
                      name="type"
                      placeholder="Nhập dữ liệu..."
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
                {/* Start Date */}
                <div>
                  <div className="flex text-xl py-4 border-b">
                    <h2 className="font-semibold flex-1">Ngày bắt đầu</h2>
                    <p className="flex-1">{coupon?.startDate || ""}</p>
                    <FaPen
                      onClick={() =>
                        setInputModifies({
                          startDate: !inputModifies.startDate,
                        })
                      }
                      className="text-sky-600 cursor-pointer ml-2"
                    />
                  </div>
                  <div
                    className={`p-2 ${!inputModifies.startDate && "hidden"}`}
                  >
                    <input
                      onChange={handleFormDataToUpdate}
                      name="startDate"
                      placeholder="Nhập dữ liệu..."
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
                {/* End date */}
                <div>
                  <div className="flex text-xl py-4 border-b">
                    <h2 className="font-semibold flex-1">Ngày kết thúc</h2>
                    <p className="flex-1">{coupon?.endDate || ""}</p>
                    <FaPen
                      onClick={() =>
                        setInputModifies({
                          endDate: !inputModifies.endDate,
                        })
                      }
                      className="text-sky-600 cursor-pointer ml-2"
                    />
                  </div>
                  <div className={`p-2 ${!inputModifies.endDate && "hidden"}`}>
                    <input
                      onChange={handleFormDataToUpdate}
                      name="endDate"
                      placeholder="Nhập dữ liệu..."
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
                {/* Usage Limit */}
                <div>
                  <div className="flex text-xl py-4 border-b">
                    <h2 className="font-semibold flex-1">Số lượng</h2>
                    <p className="flex-1">{coupon?.usageLimit || ""}</p>
                    <FaPen
                      onClick={() =>
                        setInputModifies({
                          usageLimit: !inputModifies.usageLimit,
                        })
                      }
                      className="text-sky-600 cursor-pointer ml-2"
                    />
                  </div>
                  <div
                    className={`p-2 ${!inputModifies.usageLimit && "hidden"}`}
                  >
                    <input
                      onChange={handleFormDataToUpdate}
                      name="usageLimit"
                      placeholder="Nhập dữ liệu..."
                      type="number"
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
                {/* Description */}
                <div>
                  <div className="flex text-xl py-4 border-b">
                    <h2 className="font-semibold flex-1">Mô tả</h2>
                    <p className="flex-1">{coupon?.description || ""}</p>
                    <FaPen
                      onClick={() =>
                        setInputModifies({
                          description: !inputModifies.description,
                        })
                      }
                      className="text-sky-600 cursor-pointer ml-2"
                    />
                  </div>
                  <div
                    className={`p-2 ${!inputModifies.description && "hidden"}`}
                  >
                    <input
                      onChange={handleFormDataToUpdate}
                      name="description"
                      placeholder="Nhập dữ liệu..."
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
        <dialog id="modal-delete-coupon" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Xóa dữ liệu</h3>
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
        <dialog id="modal-add-coupon" className="modal">
          <div className="modal-box">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg">Thêm dữ liệu</h3>
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
                {/* Name */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Tiêu đề <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <MdTitle className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
                      name="name"
                      type="text"
                      className="grow"
                      placeholder="Nhập dữ liệu..."
                    />
                  </label>
                  {nameError && (
                    <span className="text-rose-500 italic mt-1">
                      {nameError}
                    </span>
                  )}
                </label>
                {/* Code */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Mã <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <FaQrcode className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
                      name="code"
                      type="text"
                      className="grow"
                      placeholder="Nhập dữ liệu..."
                    />
                  </label>
                  {codeError && (
                    <span className="text-rose-500 italic mt-1">
                      {codeError}
                    </span>
                  )}
                </label>
                {/* DiscountAmount */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Giảm giá <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <FaMoneyBillWave className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
                      name="discountAmout"
                      type="number"
                      className="grow"
                      placeholder="Nhập dữ liệu..."
                    />
                  </label>
                  {discountAmountError && (
                    <span className="text-rose-500 italic mt-1">
                      {discountAmountError}
                    </span>
                  )}
                </label>
                {/* Type */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Thể loại (pt/t: Phần trăm hoặc tiền){" "}
                      <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <MdCategory className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
                      name="type"
                      type="text"
                      className="grow"
                      placeholder="Nhập dữ liệu..."
                    />
                  </label>
                  {typeError && (
                    <span className="text-rose-500 italic mt-1">
                      {typeError}
                    </span>
                  )}
                </label>
                {/* Start date */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Ngày bắt đầu <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <MdDateRange className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
                      name="startDate"
                      type="date"
                      className="grow"
                      placeholder="Nhập dữ liệu..."
                    />
                  </label>
                  {startDateError && (
                    <span className="text-rose-500 italic mt-1">
                      {startDateError}
                    </span>
                  )}
                </label>
                {/* End date */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Ngày kết thúc <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <MdDateRange className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
                      name="endDate"
                      type="date"
                      className="grow"
                      placeholder="Nhập dữ liệu..."
                    />
                  </label>
                  {endDateError && (
                    <span className="text-rose-500 italic mt-1">
                      {endDateError}
                    </span>
                  )}
                </label>
                {/* Usage limit */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Số lượng <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <GoNumber className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
                      name="usageLimit"
                      type="number"
                      className="grow"
                      placeholder="Nhập dữ liệu..."
                    />
                  </label>
                  {usageLimitError && (
                    <span className="text-rose-500 italic mt-1">
                      {usageLimitError}
                    </span>
                  )}
                </label>
                {/* Description */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">Mô tả</span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <MdDescription className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
                      name="description"
                      type="text"
                      className="grow"
                      placeholder="Nhập dữ liệu..."
                    />
                  </label>
                </label>
              </div>
              <div className="flex justify-center w-full mt-10">
                <div className="w-full md:w-1/2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className={`flex justify-center items-center w-full text-xl font-bold uppercase text-white bg-rose-600 p-4 rounded-3xl
                          ${isPending ? "bg-slate-300" : "hover:bg-sky-600"}`}
                  >
                    <span>Thêm</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </dialog>
        {/* Modal delete many */}
        <dialog id="modal-deleteMany-coupon" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Xóa dữ liệu</h3>
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

export default DashCoupon;
