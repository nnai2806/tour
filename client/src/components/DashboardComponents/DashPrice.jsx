import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaMoneyBillWave,
  FaPen,
  FaQuestionCircle,
  FaSearch,
} from "react-icons/fa";
import { MdError } from "react-icons/md";
import { useDebounce } from "use-debounce";

const DashPrice = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [listSelected, setListSelected] = useState([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [price, setPrice] = useState(null);
  const [inputModifies, setInputModifies] = useState({});
  const [formDataToUpdate, setFormDataToUpdate] = useState({});
  const [formDataToAdd, setFormDataToAdd] = useState({});
  const [successToast, setSuccessToast] = useState("");
  const [errorToast, setErrorToast] = useState("");
  const [searchText, setSearchText] = useState("");
  const [valueSearch] = useDebounce(searchText, 500);

  // States manage input's errors
  const [priceForAdultError, setPriceForAdultError] = useState("");
  const [priceForChildrenError, setPriceForChildrenError] = useState("");
  const [priceForBabyError, setPriceForBabyError] = useState("");

  // ==============================================
  // Method call API
  const fetchPrices = async (page = 0, valueSearch) => {
    const res = await axios.get(
      `/api/price/get?page=${page}&search=${valueSearch}`
    );
    return res.data;
  };

  const addPrice = async (formDataToUpdate) => {
    const res = await axios.post("/api/price/create", formDataToUpdate);
    return res.data;
  };

  const updatePrice = async (formDataToUpdate) => {
    const res = await axios.put(
      `/api/price/update/${price._id}`,
      formDataToUpdate
    );
    return res.data;
  };

  const deletePrice = async (id) => {
    await axios.delete(`/api/price/delete/${id}`);
  };

  const deleteManyPrice = async (listId) => {
    await axios.delete("/api/price/delete", {
      data: { priceIds: listId },
    });
  };
  // ==============================================
  // Hanlde mutation
  const mutationAdd = useMutation({
    mutationFn: addPrice,
    onSuccess: () => {
      setSuccessToast("Thêm thành công!");
      queryClient.invalidateQueries("prices");
    },
    onError: (error) => {
      const { message } = error.response.data;
      if (message) {
        if (message.includes("E11000")) {
          setErrorToast("Dữ liệu đã tồn tại!");
        } else if (message.includes("Cast to Number")) {
          setErrorToast("Dữ liệu là số!");
        } else {
          setErrorToast(message);
        }
      }
    },
  });

  const mutationUpdate = useMutation({
    mutationFn: updatePrice,
    onSuccess: (data) => {
      queryClient.invalidateQueries("prices");
      setPrice(data);
      setSuccessToast("Cập nhật thành công!");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const mutationDelete = useMutation({
    mutationFn: deletePrice,
    onSuccess: () => {
      queryClient.invalidateQueries("prices");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const mutationDeleteMany = useMutation({
    mutationFn: deleteManyPrice,
    onSuccess: () => {
      queryClient.invalidateQueries("prices");
      setSelectedAll(false);
      setListSelected([]);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  // Fetch data
  const { isPending, data } = useQuery({
    queryKey: ["prices", page, valueSearch],
    queryFn: () => fetchPrices(page, valueSearch),
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
    // Validate priceForAdult
    if (formDataToAdd.priceForAdult !== undefined) {
      if (!formDataToAdd.priceForAdult) {
        setPriceForAdultError("Vui lòng nhập trường này!");
      } else {
        setPriceForAdultError("");
      }
    } else {
      setPriceForAdultError("");
    }
    // Validate priceForChildren
    if (formDataToAdd.priceForChildren !== undefined) {
      if (!formDataToAdd.priceForChildren) {
        setPriceForChildrenError("Vui lòng nhập trường này!");
      } else {
        setPriceForChildrenError("");
      }
    } else {
      setPriceForChildrenError("");
    }
    // Validate priceForBaby
    if (formDataToAdd.priceForBaby !== undefined) {
      if (!formDataToAdd.priceForBaby) {
        setPriceForBabyError("Vui lòng nhập trường này!");
      } else {
        setPriceForBabyError("");
      }
    } else {
      setPriceForBabyError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formDataToAdd]);

  const onUpdate = async () => {
    mutationUpdate.mutate(formDataToUpdate);
  };

  const handleDelete = () => {
    mutationDelete.mutate(price._id);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formDataToAdd.priceForAdult) {
      setPriceForAdultError("Vui lòng nhập trường này!");
      return;
    } else if (!formDataToAdd.priceForChildren) {
      setPriceForChildrenError("Vui lòng nhập trường này!");
      return;
    } else if (!formDataToAdd.priceForBaby) {
      setPriceForBabyError("Vui lòng nhập trường này!");
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
      setListSelected(data?.prices.map((item) => item._id));
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
    if (page === Math.ceil(data?.totalPrices / 9) - 1) {
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

  const handleShowDetailModal = (price) => {
    setFormDataToUpdate({});
    setInputModifies({});
    setPrice(price);
    document.getElementById("modal-details-price").showModal();
  };

  const handleShowModifyModal = (price) => {
    setFormDataToUpdate({});
    setInputModifies({});
    setPrice(price);
    document.getElementById("modal-modify-price").showModal();
  };

  const handleShowDeleteModal = (price) => {
    setPrice(price);
    document.getElementById("modal-delete-price").showModal();
  };

  const handleShowAddModal = () => {
    document.getElementById("modal-add-price").showModal();
  };

  const handleShowDeleteManyModal = () => {
    document.getElementById("modal-deleteMany-price").showModal();
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
                  <th>Giá cho người lớn</th>
                  <th>Giá cho trẻ nhỏ</th>
                  <th>Giá cho em bé</th>
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
                {data.prices.length !== 0 ? (
                  data.prices.map((price) => (
                    <tr key={price._id}>
                      <th>
                        <label>
                          <input
                            checked={listSelected.includes(price._id)}
                            onChange={() => toggleSelectSingle(price._id)}
                            type="checkbox"
                            className="checkbox"
                          />
                        </label>
                      </th>
                      <td>
                        {price.priceForAdult || (
                          <span className="italic text-sm">Chưa cập nhật</span>
                        )}
                      </td>
                      <td>
                        {price.priceForChildren || (
                          <span className="italic text-sm">Chưa cập nhật</span>
                        )}
                      </td>
                      <td>
                        {price.priceForBaby || (
                          <span className="italic text-sm">Chưa cập nhật</span>
                        )}
                      </td>
                      <th className="pr-0">
                        <div className="flex gap-2 flex-wrap items-center justify-end">
                          <button
                            onClick={() => handleShowDetailModal(price)}
                            className="text-nowrap btn btn-ghost md:btn-xs border border-black"
                          >
                            Chi tiết
                          </button>
                          <button
                            onClick={() => handleShowModifyModal(price)}
                            className="text-nowrap btn btn-ghost md:btn-xs border border-black"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleShowDeleteModal(price)}
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
        {data?.prices.length !== 0 && (
          <div className="join mt-4 flex justify-center">
            <button
              onClick={handlePreviousPage}
              className={`join-item btn ${page === 0 && "btn-disabled"}`}
            >
              «
            </button>
            <button className="join-item btn">
              Trang {page + 1} / {Math.ceil(data?.totalPrices / 9)}
            </button>
            <button
              onClick={handleNextPage}
              className={`join-item btn ${
                page === Math.ceil(data?.totalPrices / 9) - 1 && "btn-disabled"
              }`}
            >
              »
            </button>
          </div>
        )}
        {/* Modal details */}
        <dialog id="modal-details-price" className="modal">
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
                    <strong>Giá cho người lớn: </strong>
                    {price?.priceForAdult || "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Giá cho trẻ nhỏ: </strong>
                    {price?.priceForChildren || "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Giá cho em bé: </strong>
                    {price?.priceForBaby || "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Ngày tạo: </strong>
                    {moment(price?.createdAt).format("DD/MM/YYYY HH:mm:ss") ||
                      "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Chỉnh sửa lúc: </strong>
                    {moment(price?.updatedAt).format("DD/MM/YYYY HH:mm:ss") ||
                      "Chưa cập nhật"}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </dialog>
        {/* Modal modify */}
        <dialog id="modal-modify-price" className="modal">
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
                {/* Price for adult */}
                <div>
                  <div className="flex text-xl py-4 border-b">
                    <h2 className="font-semibold flex-1">Giá cho người lớn</h2>
                    <p className="flex-1">{price?.priceForAdult || ""}</p>
                    <FaPen
                      onClick={() =>
                        setInputModifies({
                          priceForAdult: !inputModifies.priceForAdult,
                        })
                      }
                      className="text-sky-600 cursor-pointer ml-2"
                    />
                  </div>
                  <div
                    className={`p-2 ${
                      !inputModifies.priceForAdult && "hidden"
                    }`}
                  >
                    <input
                      onChange={handleFormDataToUpdate}
                      name="priceForAdult"
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
                {/* Price for children */}
                <div>
                  <div className="flex text-xl py-4 border-b">
                    <h2 className="font-semibold flex-1">Giá cho trẻ nhỏ</h2>
                    <p className="flex-1">{price?.priceForChildren || ""}</p>
                    <FaPen
                      onClick={() =>
                        setInputModifies({
                          priceForChildren: !inputModifies.priceForChildren,
                        })
                      }
                      className="text-sky-600 cursor-pointer ml-2"
                    />
                  </div>
                  <div
                    className={`p-2 ${
                      !inputModifies.priceForChildren && "hidden"
                    }`}
                  >
                    <input
                      onChange={handleFormDataToUpdate}
                      name="priceForChildren"
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
                {/* Price for baby */}
                <div>
                  <div className="flex text-xl py-4 border-b">
                    <h2 className="font-semibold flex-1">Giá cho em bé</h2>
                    <p className="flex-1">{price?.priceForBaby || ""}</p>
                    <FaPen
                      onClick={() =>
                        setInputModifies({
                          priceForBaby: !inputModifies.priceForBaby,
                        })
                      }
                      className="text-sky-600 cursor-pointer ml-2"
                    />
                  </div>
                  <div
                    className={`p-2 ${!inputModifies.priceForBaby && "hidden"}`}
                  >
                    <input
                      onChange={handleFormDataToUpdate}
                      name="priceForBaby"
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
        <dialog id="modal-delete-price" className="modal">
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
        <dialog id="modal-add-price" className="modal">
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
                {/* Price for adult */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Giá cho người lớn <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <FaMoneyBillWave className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
                      name="priceForAdult"
                      type="text"
                      className="grow"
                      placeholder="Nhập dữ liệu..."
                    />
                  </label>
                  {priceForAdultError && (
                    <span className="text-rose-500 italic mt-1">
                      {priceForAdultError}
                    </span>
                  )}
                </label>
                {/* Price for children */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Giá cho trẻ nhỏ <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <FaMoneyBillWave className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
                      name="priceForChildren"
                      type="text"
                      className="grow"
                      placeholder="Nhập dữ liệu..."
                    />
                  </label>
                  {priceForChildrenError && (
                    <span className="text-rose-500 italic mt-1">
                      {priceForChildrenError}
                    </span>
                  )}
                </label>
                {/* Price for baby */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Giá cho em bé <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <FaMoneyBillWave className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
                      name="priceForBaby"
                      type="text"
                      className="grow"
                      placeholder="Nhập dữ liệu..."
                    />
                  </label>
                  {priceForBabyError && (
                    <span className="text-rose-500 italic mt-1">
                      {priceForBabyError}
                    </span>
                  )}
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
        <dialog id="modal-deleteMany-price" className="modal">
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

export default DashPrice;
