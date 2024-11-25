import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaQuestionCircle, FaSearch } from "react-icons/fa";
import { MdError } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";

const DashOrder = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [listSelected, setListSelected] = useState([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [order, setOrder] = useState(null);
  const [successToast, setSuccessToast] = useState("");
  const [errorToast, setErrorToast] = useState("");
  const [searchText, setSearchText] = useState("");
  const [valueSearch] = useDebounce(searchText, 500);

  // ==============================================
  // Method call API
  const fetchOrders = async (page = 0, valueSearch) => {
    const res = await axios.get(
      `/api/order/get?page=${page}&search=${valueSearch}`
    );
    return res.data;
  };

  const updateOrder = async (formDataToUpdate) => {
    const res = await axios.put(
      `/api/order/update/${order._id}`,
      formDataToUpdate
    );
    return res.data;
  };

  const deleteOrder = async (id) => {
    await axios.delete(`/api/order/delete/${id}`);
  };

  const deleteManyOrder = async (listId) => {
    await axios.delete("/api/order/delete", {
      data: { orderIds: listId },
    });
  };
  // ==============================================
  const mutationUpdate = useMutation({
    mutationFn: updateOrder,
    onSuccess: (data) => {
      queryClient.invalidateQueries("orders");
      setOrder(data);
      setSuccessToast("Cập nhật thành công!");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const mutationDelete = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries("orders");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const mutationDeleteMany = useMutation({
    mutationFn: deleteManyOrder,
    onSuccess: () => {
      queryClient.invalidateQueries("orders");
      setSelectedAll(false);
      setListSelected([]);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  // Fetch data
  const { isPending, data } = useQuery({
    queryKey: ["orders", page, valueSearch],
    queryFn: () => fetchOrders(page, valueSearch),
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

  const handleDelete = () => {
    mutationDelete.mutate(order._id);
  };

  const handleDeleteMany = () => {
    mutationDeleteMany.mutate(listSelected);
  };

  const toggleSelectAll = () => {
    setSelectedAll(!selectedAll);
    if (!selectedAll) {
      setListSelected(data?.orders.map((item) => item._id));
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
    if (page === Math.ceil(data?.totalOrders / 9) - 1) {
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

  const handleShowDetailModal = (order) => {
    setOrder(order);
    document.getElementById("modal-details-order").showModal();
  };

  const handleShowModifyModal = (order) => {
    setOrder(order);
    document.getElementById("modal-modify-order").showModal();
  };

  const handleShowDeleteModal = (order) => {
    setOrder(order);
    document.getElementById("modal-delete-order").showModal();
  };

  const handleShowDeleteManyModal = () => {
    document.getElementById("modal-deleteMany-order").showModal();
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
          Quản lý đơn hàng
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
                  <th>Tên tour</th>
                  <th>Ngày đặt</th>
                  <th>Trạng thái</th>
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
                {/* row */}
                {data.orders.length !== 0 ? (
                  data.orders.map((order) => (
                    <tr key={order._id}>
                      <th>
                        <label>
                          <input
                            checked={listSelected.includes(order._id)}
                            onChange={() => toggleSelectSingle(order._id)}
                            type="checkbox"
                            className="checkbox"
                          />
                        </label>
                      </th>
                      <td>
                        <p className="line-clamp-2">{order?.tour?.name}</p>
                      </td>
                      <td>
                        {moment(order.createdAt).format("DD/MM/yyyy") || (
                          <span className="italic text-sm">Chưa cập nhật</span>
                        )}
                      </td>
                      <td>{order.status}</td>
                      <th className="pr-0">
                        <div className="flex gap-2 flex-wrap items-center justify-end">
                          <button
                            onClick={() => handleShowDetailModal(order)}
                            className="text-nowrap btn btn-ghost md:btn-xs border border-black"
                          >
                            Chi tiết
                          </button>
                          <button
                            onClick={() => handleShowModifyModal(order)}
                            className="text-nowrap btn btn-ghost md:btn-xs border border-black"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleShowDeleteModal(order)}
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
        {data?.orders.length !== 0 && (
          <div className="join mt-4 flex justify-center">
            <button
              onClick={handlePreviousPage}
              className={`join-item btn ${page === 0 && "btn-disabled"}`}
            >
              «
            </button>
            <button className="join-item btn">
              Trang {page + 1} / {Math.ceil(data?.totalOrders / 9)}
            </button>
            <button
              onClick={handleNextPage}
              className={`join-item btn ${
                page === Math.ceil(data?.totalOrders / 9) - 1 && "btn-disabled"
              }`}
            >
              »
            </button>
          </div>
        )}
        {/* Modal details */}
        <dialog id="modal-details-order" className="modal">
          <div className="modal-box">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg">Thông tin đơn hàng</h3>
            <div className="my-4">
              <div className="py-4">
                <p>
                  <strong>Tên tour:</strong>{" "}
                  <span className="text-sky-700 font-bold">
                    {order?.tour?.name}
                  </span>
                </p>
                <p>
                  <strong>Tên người đặt tour:</strong>{" "}
                  <span className="text-sky-700 font-bold">
                    {order?.user?.fullName}
                  </span>
                </p>
                <p>
                  <strong>Số điện thoại: </strong>{" "}
                  <span className="text-sky-700 font-bold">
                    {order?.user?.phone || "Chưa cập nhật"}
                  </span>
                </p>
                <p>
                  <strong>Email: </strong>{" "}
                  <span className="text-sky-700 font-bold">
                    {order?.user?.email || "Chưa cập nhật"}
                  </span>
                </p>
                <p>
                  <strong>Ngày đặt:</strong>{" "}
                  {moment(order?.createdAt).format("DD/MM/yyyy")}
                </p>
                <p className="flex gap-4">
                  <strong>Người lớn:</strong> {order?.numOfAdults}
                  <strong>Trẻ em:</strong> {order?.numOfChildren}
                  <strong>Em bé:</strong> {order?.numOfBabies}
                </p>
                <p>
                  <strong>Số tiền cần thanh toán:</strong>{" "}
                  <span className="text-red-500 font-bold">
                    {Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order?.totalPrice)}
                  </span>
                </p>
                <p>
                  <strong>Phương thức thanh toán:</strong>{" "}
                  {order?.paymentMethod}
                </p>
                <p className="text-green-600">
                  <strong>Trạng thái thanh toán:</strong> {order?.status}
                </p>
                <button
                  onClick={() => navigate(`/tour/v/${order?.tour?._id}`)}
                  className="btn btn-link"
                >
                  Xem chi tiết tour ở đây
                </button>
              </div>
            </div>
          </div>
        </dialog>
        {/* Modal modify */}
        <dialog id="modal-modify-order" className="modal">
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
                {/* Payment method choosing update */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Chọn phương thức thanh toán{" "}
                      <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <select
                    onChange={(e) => {
                      mutationUpdate.mutate({ paymentMethod: e.target.value });
                    }}
                    defaultValue={"Chọn phương thức thanh toán"}
                    className="select select-bordered w-full max-w-xs"
                  >
                    <option disabled>Chọn phương thức thanh toán</option>
                    <option value="Tiền mặt">Tiền mặt</option>
                    <option value="Ngân hàng">Ngân hàng</option>
                  </select>
                </label>
                {/* Status choosing update */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Chọn trạng thái thanh toán{" "}
                      <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <select
                    onChange={(e) => {
                      mutationUpdate.mutate({ status: e.target.value });
                    }}
                    defaultValue={"Chọn trạng thái thanh toán"}
                    className="select select-bordered w-full max-w-xs"
                  >
                    <option disabled>Chọn trạng thái thanh toán</option>
                    <option value="Chưa thanh toán">Chưa thanh toán</option>
                    <option value="Đã thanh toán">Đã thanh toán</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
        </dialog>
        {/* Modal delete */}
        <dialog id="modal-delete-order" className="modal">
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

        {/* Modal delete many */}
        <dialog id="modal-deleteMany-order" className="modal">
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

export default DashOrder;
