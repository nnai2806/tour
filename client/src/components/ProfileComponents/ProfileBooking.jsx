import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import moment from "moment";
import { useState } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProfileBooking = ({ currentUser }) => {
  let stt = 0;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [orderSelected, setOrderSelected] = useState(null);

  // API
  const fetchOrders = async (userId) => {
    const res = await axios.get(`/api/order/get?user=${userId}&limit=1000`);
    return res.data;
  };
  const deleteOrders = async (orderId) => {
    const res = await axios.delete(`/api/order/delete/${orderId}`);
    return res.data;
  };
  const updateTour = async ({ id, formData }) => {
    const res = await axios.put(`/api/tour/update/${id}`, formData);
    return res.data;
  };

  // Fetch data
  const { isLoading, data } = useQuery({
    queryKey: ["orders", currentUser._id],
    queryFn: () => fetchOrders(currentUser._id),
    placeholderData: keepPreviousData,
  });
  // Mutation
  const deleteOrderMutation = useMutation({
    mutationFn: deleteOrders,
    onSuccess: () => {
      toast.success("Hủy đặt tour thành công!");
      updateTourMutate.mutate({
        id: orderSelected.tour._id,
        formData: {
          availableSeats:
            orderSelected.tour.availableSeats +
            orderSelected.numOfAdults +
            orderSelected.numOfChildren +
            orderSelected.numOfBabies,
        },
      });
      queryClient.invalidateQueries("orders");
    },
    onError: () => {
      toast.error("Lỗi!");
    },
  });
  const updateTourMutate = useMutation({
    mutationFn: updateTour,
  });

  const handlePayment = async () => {
    const res1 = await axios.post(`/api/order/vnpay`, {
      amount: orderSelected.totalPrice,
      orderId: orderSelected._id,
    });
    if (res1.status === 200) {
      const res2 = await axios.put(`/api/order/update/${orderSelected._id}`, {
        status: "Đã thanh toán",
        paymentMethod: "Ngân hàng",
      });
      if (res2.status === 200) {
        queryClient.invalidateQueries("orders");
        window.location.href = res1.data;
      }
    }
  };

  return (
    <div className="border p-4 rounded-md">
      <h1 id="info" className="text-xl font-bold pb-4 border-b-2 text-sky-600">
        Tour đã đặt
      </h1>
      <div className="overflow-x-auto">
        {isLoading ? (
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
                <th>STT</th>
                <th>Tên tour</th>
                <th>Ngày đặt</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {/* row */}
              {data.orders.map((item) => (
                <tr key={item._id}>
                  <th>{++stt}</th>
                  <td className="font-bold">{item?.tour?.name}</td>
                  <td>{moment(item.createdAt).format("DD/MM/yyyy")}</td>
                  <td>{item.status}</td>
                  <td className="flex flex-wrap gap-1 justify-end">
                    <button
                      onClick={() => {
                        setOrderSelected(item);
                        document.getElementById("showDetails").showModal();
                      }}
                      className="btn text-white btn-sm btn-info"
                    >
                      Xem
                    </button>
                    {item.status !== "Đã thanh toán" && (
                      <button
                        onClick={() => {
                          document
                            .getElementById("modal-delete-order")
                            .showModal();
                          setOrderSelected(item);
                        }}
                        className="btn text-white btn-sm btn-error"
                      >
                        Hủy
                      </button>
                    )}
                    {item.status !== "Đã thanh toán" && (
                      <button
                        onClick={() => {
                          document
                            .getElementById("modal-payment-order")
                            .showModal();
                          setOrderSelected(item);
                        }}
                        className="btn text-white btn-sm btn-success"
                      >
                        Thanh toán
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal show order */}
      <dialog id="showDetails" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Chi tiết đặt tour!</h3>
          <div className="py-4">
            <p>
              <strong>Tên tour:</strong>{" "}
              <span className="text-sky-700 font-bold">
                {orderSelected?.tour?.name}
              </span>
            </p>
            <p>
              <strong>Ngày đặt:</strong>{" "}
              {moment(orderSelected?.createdAt).format("DD/MM/yyyy")}
            </p>
            <p className="flex gap-4">
              <strong>Người lớn:</strong> {orderSelected?.numOfAdults}
              <strong>Trẻ em:</strong> {orderSelected?.numOfChildren}
              <strong>Em bé:</strong> {orderSelected?.numOfBabies}
            </p>
            <p>
              <strong>Số tiền cần thanh toán:</strong>{" "}
              <span className="text-red-500 font-bold">
                {Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(orderSelected?.totalPrice)}
              </span>
            </p>
            <p>
              <strong>Phương thức thanh toán:</strong>{" "}
              {orderSelected?.paymentMethod}
            </p>
            <p className="text-green-600">
              <strong>Trạng thái thanh toán:</strong> {orderSelected?.status}
            </p>
            <button
              onClick={() => navigate(`/tour/v/${orderSelected?.tour?._id}`)}
              className="btn btn-link"
            >
              Xem chi tiết tour ở đây
            </button>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>

      {/* Modal confirm delete order */}
      <dialog id="modal-delete-order" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Xóa dữ liệu</h3>
          <div className="flex flex-col items-center gap-4 my-4">
            <FaQuestionCircle className="text-4xl text-slate-500" />
            <p className="text-xl text-slate-500">
              Bạn có chắc muốn hủy tour này?
            </p>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <div className="flex gap-8">
                <button className="btn">Hủy</button>
                <button
                  onClick={() => {
                    deleteOrderMutation.mutate(orderSelected?._id);
                  }}
                  className="btn btn-error"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      </dialog>

      {/* Modal confirm payment order */}
      <dialog id="modal-payment-order" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Thanh toán tour</h3>
          <div className="flex flex-col items-center gap-4 my-4">
            <FaQuestionCircle className="text-4xl text-slate-500" />
            <p className="text-xl text-slate-500">
              Bạn có chắc muốn thanh toán tour này?
            </p>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <div className="flex gap-8">
                <button className="btn">Hủy</button>
                <button
                  onClick={() => {
                    handlePayment();
                  }}
                  className="btn btn-info"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default ProfileBooking;
