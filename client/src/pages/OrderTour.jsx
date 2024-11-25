import { Link, useNavigate, useParams } from "react-router-dom";
import Container from "../components/Container";
import { useEffect, useState } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { updateSuccess } from "../redux/user/userSlice";

import { BsBank2, BsCashCoin } from "react-icons/bs";
import {
  FaBusinessTime,
  FaCar,
  FaCheckToSlot,
  FaLocationDot,
} from "react-icons/fa6";

// API
const updateUser = async ({ id, formData }) => {
  const res = await axios.put(`/api/user/update/${id}`, formData);
  return res.data;
};
const updateTour = async ({ id, formData }) => {
  const res = await axios.put(`/api/tour/update/${id}`, formData);
  return res.data;
};

const OrderTour = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { tourId } = useParams();
  const [tour, setTour] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [couponSelected, setCouponSelected] = useState(null);

  // States
  const [numberOfAdults, setNumberOfAdults] = useState(1);
  const [numberOfChildren, setNumberOfChildren] = useState(0);
  const [numberOfBaby, setNumberOfBaby] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [note, setNote] = useState("");

  // Mutation
  const updateUserMutate = useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      dispatch(updateSuccess(data));
      toast.success("Đã cập nhật thông tin người dùng!");
    },
    onError: () => {
      toast.error("Lỗi!");
    },
  });
  const updateTourMutate = useMutation({
    mutationFn: updateTour,
  });

  // Get tour
  useEffect(() => {
    const getTourById = async (id) => {
      const res = await axios.get(`/api/tour/get?id=${id}`);
      if (res.data.tours) {
        setTour(res.data.tours[0]);
      }
    };
    if (tourId) {
      getTourById(tourId);
    }
  }, [tourId]);

  // Get coupons
  useEffect(() => {
    const getCoupons = async () => {
      const res = await axios.get("/api/coupon/get?limit=1000");
      if (res.data.coupons) {
        setCoupons(res.data.coupons);
      }
    };
    getCoupons();
  }, [tourId]);

  const getDiscountText = (type, disc) => {
    let result;
    if (type === "t") {
      result = Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(disc);
    } else {
      result = disc + "%";
    }
    return result;
  };

  const calcDiscount = (type, disc, total) => {
    let result = disc;
    if (type === "t") {
      result = total - disc;
      if (result <= 0) result = 0;
    } else {
      result = total - (total * disc) / 100;
    }
    return result;
  };

  const handleOrderTour = async (
    totalPrice,
    numOfAdults,
    numOfChildren,
    numOfBabies
  ) => {
    if (!currentUser.fullName || currentUser.fullName === "") {
      toast.warning("Nhập tên người dùng!");
      return;
    } else if (!currentUser.email || currentUser.email === "") {
      toast.warning("Nhập email!");
      return;
    } else if (!currentUser.phone || currentUser.phone === "") {
      toast.warning("Nhập số điện thoại!");
      return;
    } else if (!currentUser.address || currentUser.address === "") {
      toast.warning("Nhập địa chỉ!");
      return;
    } else if (
      numOfAdults + numOfChildren + numOfBabies >
      tour.availableSeats
    ) {
      toast.warning(`Số chỗ trống còn lại ${tour.availableSeats}!`);
      return;
    }
    const paymentMethod1 = paymentMethod === "cash" ? "Tiền mặt" : "Ngân hàng";
    try {
      if (paymentMethod === "cash") {
        const res = await axios.post(`/api/order/create`, {
          user: currentUser._id,
          tour: tourId,
          paymentMethod: paymentMethod1,
          status: "Chưa thanh toán",
          totalPrice: totalPrice,
          numOfAdults: numOfAdults,
          numOfChildren: numOfChildren,
          numOfBabies: numOfBabies,
          note: note,
        });
        if (res.status === 201) {
          toast.success("Đặt tour thành công!");
          updateTourMutate.mutate({
            id: tourId,
            formData: {
              availableSeats:
                tour.availableSeats -
                (numOfAdults + numOfChildren + numOfBabies),
            },
          });
          setTimeout(() => {
            navigate("/profile?tab=booking");
          }, 2000);
        }
      } else if (paymentMethod === "bank") {
        const res = await axios.post(`/api/order/create`, {
          user: currentUser._id,
          tour: tourId,
          paymentMethod: paymentMethod1,
          status: "Chưa thanh toán",
          totalPrice: totalPrice,
          numOfAdults: numOfAdults,
          numOfChildren: numOfChildren,
          numOfBabies: numOfBabies,
          note: note,
        });
        if (res.status === 201) {
          const res1 = await axios.post(`/api/order/vnpay`, {
            amount: totalPrice,
            orderId: res.data._id,
          });
          if (res1.status === 200) {
            const res2 = await axios.put(`/api/order/update/${res.data._id}`, {
              status: "Đã thanh toán",
            });
            if (res2.status === 200) {
              window.location.href = res1.data;
            }
          }
        }
      }
    } catch (error) {
      toast.error("Lỗi");
      console.log(error);
    }
  };

  return (
    <Container>
      <div>
        {/* Breadscrumbs section */}
        <div className="breadcrumbs">
          <ul>
            <li>
              <Link to={"/"}>Trang chủ</Link>
            </li>
            <li>
              <Link>
                <p>{tour?.name}</p>
              </Link>
            </li>
          </ul>
        </div>

        {/* Main section */}
        <div>
          <h1 className="text-center text-3xl uppercase font-bold text-sky-600 my-8">
            Đặt tour
          </h1>
          <div className="flex gap-10">
            <div className="flex-1">
              {/* Info passenger */}
              <div>
                <h1 className="uppercase font-bold text-xl mb-4">
                  Thông tin liên lạc
                </h1>
                <form className="flex flex-col gap-4 border p-4 mb-4">
                  <div className="flex flex-col">
                    <label className="font-bold" htmlFor="fullName">
                      Họ tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      onBlur={(e) =>
                        updateUserMutate.mutate({
                          id: currentUser._id,
                          formData: {
                            fullName: e.target.value,
                          },
                        })
                      }
                      defaultValue={currentUser.fullName}
                      className="input"
                      type="text"
                      id="fullName"
                      placeholder="Nhập họ tên..."
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-bold" htmlFor="email">
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      onBlur={(e) =>
                        updateUserMutate.mutate({
                          id: currentUser._id,
                          formData: {
                            email: e.target.value,
                          },
                        })
                      }
                      defaultValue={currentUser.email}
                      className="input"
                      type="email"
                      id="email"
                      placeholder="Nhập email..."
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-bold" htmlFor="phone">
                      Số điện thoại <span className="text-rose-500">*</span>
                    </label>
                    <input
                      onBlur={(e) =>
                        updateUserMutate.mutate({
                          id: currentUser._id,
                          formData: {
                            phone: e.target.value,
                          },
                        })
                      }
                      defaultValue={currentUser.phone}
                      className="input"
                      type="text"
                      id="phone"
                      placeholder="Nhập số điện thoại..."
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-bold" htmlFor="address">
                      Địa chỉ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      onBlur={(e) =>
                        updateUserMutate.mutate({
                          id: currentUser._id,
                          formData: {
                            address: e.target.value,
                          },
                        })
                      }
                      defaultValue={currentUser.address}
                      className="input"
                      type="text"
                      id="address"
                      placeholder="Nhập địa chỉ..."
                    />
                  </div>
                </form>
              </div>
              {/* Passenger */}
              <div>
                <h1 className="uppercase font-bold text-xl mb-4">Hành khách</h1>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between border p-4">
                    <div>
                      <h3 className="font-bold text-xl">Người lớn</h3>
                      <p>Từ 12 tuổi trở lên</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        className="px-4 py-2 rounded-md bg-slate-300 hover:bg-sky-200 font-bold"
                        onClick={() => {
                          if (numberOfAdults <= 1) {
                            setNumberOfAdults(1);
                          } else {
                            setNumberOfAdults((prev) => prev - 1);
                          }
                        }}
                      >
                        -
                      </button>
                      <p className="font-bold text-xl">{numberOfAdults}</p>
                      <button
                        className="px-4 py-2 rounded-md bg-slate-300 hover:bg-sky-200 font-bold"
                        onClick={() => {
                          setNumberOfAdults((prev) => prev + 1);
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between border p-4">
                    <div>
                      <h3 className="font-bold text-xl">Trẻ em</h3>
                      <p>Từ 2 tuổi đến 11 tuổi</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        className="px-4 py-2 rounded-md bg-slate-300 hover:bg-sky-200 font-bold"
                        onClick={() => {
                          if (numberOfChildren <= 0) {
                            setNumberOfChildren(0);
                          } else {
                            setNumberOfChildren((prev) => prev - 1);
                          }
                        }}
                      >
                        -
                      </button>
                      <p className="font-bold text-xl">{numberOfChildren}</p>
                      <button
                        className="px-4 py-2 rounded-md bg-slate-300 hover:bg-sky-200 font-bold"
                        onClick={() => {
                          setNumberOfChildren((prev) => prev + 1);
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between border p-4">
                    <div>
                      <h3 className="font-bold text-xl">Em bé</h3>
                      <p>Dưới 2 tuổi</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        className="px-4 py-2 rounded-md bg-slate-300 hover:bg-sky-200 font-bold"
                        onClick={() => {
                          if (numberOfBaby <= 0) {
                            setNumberOfBaby(0);
                          } else {
                            setNumberOfBaby((prev) => prev - 1);
                          }
                        }}
                      >
                        -
                      </button>
                      <p className="font-bold text-xl">{numberOfBaby}</p>
                      <button
                        className="px-4 py-2 rounded-md bg-slate-300 hover:bg-sky-200 font-bold"
                        onClick={() => {
                          setNumberOfBaby((prev) => prev + 1);
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Note */}
              <div>
                <h1 className="uppercase font-bold text-xl my-4">Ghi chú</h1>
                <div>
                  <textarea
                    onChange={(e) => setNote(e.target.value)}
                    className="textarea textarea-bordered w-full"
                    placeholder="Quý khách có ghi chú lưu ý gì, hãy nói với chúng tôi"
                  ></textarea>
                </div>
              </div>
              {/* Payment method */}
              <div>
                <h1 className="uppercase font-bold text-xl my-4">
                  Hình thức thanh toán
                </h1>
                <div className="flex gap-4">
                  {/* Cash */}
                  <div className="flex border p-4 items-center gap-4 cursor-pointer hover:text-sky-500">
                    <input
                      type="radio"
                      name="payments"
                      className="radio"
                      defaultChecked
                      id="cash"
                      onChange={(e) => setPaymentMethod(e.target.id)}
                    />
                    <label
                      className="font-bold flex items-center gap-4 cursor-pointer"
                      htmlFor="cash"
                    >
                      Tiền mặt <BsCashCoin />
                    </label>
                  </div>
                  {/* Bank */}
                  <div className="flex border p-4 items-center gap-4 cursor-pointer hover:text-sky-500">
                    <input
                      type="radio"
                      name="payments"
                      className="radio"
                      id="bank"
                      onChange={(e) => setPaymentMethod(e.target.id)}
                    />
                    <label
                      className="font-bold flex items-center gap-4 cursor-pointer"
                      htmlFor="bank"
                    >
                      Ngân hàng <BsBank2 />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h1 className="uppercase font-bold text-xl mb-4">
                Tóm tắt chuyến đi
              </h1>
              <div className="divide-y">
                <div>
                  <img
                    className="object-cover h-56 w-full rounded-md"
                    src={tour?.images[0]}
                    alt={tour?.name}
                  />
                  <h1 className="font-bold text-xl my-2">{tour?.name}</h1>
                </div>
                <div className="pt-2">
                  <p className="flex items-center gap-2 text-sky-700">
                    <FaLocationDot />
                    <span>
                      <strong>Khởi hành:</strong> {tour?.startDestination?.name}
                    </span>
                  </p>
                  <p className="flex items-center gap-2 text-sky-700">
                    <FaBusinessTime />
                    <span>
                      <strong>Thời gian:</strong> {tour?.startDate} đến{" "}
                      {tour?.endDate}
                    </span>
                  </p>
                  <p className="flex items-center gap-2 text-sky-700">
                    <FaCar />
                    <span>
                      <strong>Phương tiện:</strong> {tour?.vehicle}
                    </span>
                  </p>
                  <p className="flex items-center gap-2 text-sky-700">
                    <FaCheckToSlot />
                    <span>
                      <strong>Số chỗ trống:</strong> {tour?.availableSeats}
                    </span>
                  </p>
                  <p className="text-sky-700 my-2">
                    <span>
                      <strong>Các điểm đến:</strong>{" "}
                      {tour?.destinations?.map((item) => item?.name).join(", ")}
                    </span>
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between font-bold text-xl">
                    <h1 className="uppercase my-2">Giá</h1>
                    <h1 className="text-red-500">
                      {Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(
                        tour?.price?.priceForAdult * numberOfAdults +
                          tour?.price?.priceForChildren * numberOfChildren +
                          tour?.price?.priceForBaby * numberOfBaby
                      )}
                    </h1>
                  </div>
                  <div>
                    {/* Adult */}
                    <p className="flex justify-between text-xl text-sky-700">
                      <span>
                        <strong>Người lớn:</strong>{" "}
                        {Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(tour?.price?.priceForAdult * numberOfAdults)}
                      </span>
                      <span>x{numberOfAdults}</span>
                    </p>
                    {/* Children */}
                    <p className="flex justify-between text-xl text-sky-700">
                      <span>
                        <strong>Trẻ em:</strong>{" "}
                        {Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(
                          tour?.price?.priceForChildren * numberOfChildren
                        )}
                      </span>
                      <span>x{numberOfChildren}</span>
                    </p>
                    {/* Baby */}
                    <p className="flex justify-between text-xl text-sky-700">
                      <span>
                        <strong>Em bé:</strong>{" "}
                        {Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(tour?.price?.priceForBaby * numberOfBaby)}
                      </span>
                      <span>x{numberOfBaby}</span>
                    </p>
                  </div>
                </div>
                <div className="my-2">
                  <div className="flex justify-between items-center">
                    <h1 className="font-bold text-xl uppercase my-2">
                      Mã giảm giá
                    </h1>
                    <button
                      onClick={() =>
                        document.getElementById("coupon").showModal()
                      }
                      className="bg-sky-700 text-white px-2 py-1 rounded-md hover:opacity-70 transition-opacity"
                    >
                      Thêm mã giảm giá
                    </button>
                    <dialog id="coupon" className="modal">
                      <div className="modal-box">
                        <h3 className="font-bold text-xl">Mã giảm giá</h3>
                        <div className="py-4">
                          <div className="flex justify-between gap-4">
                            <input
                              placeholder="Nhập mã giảm giá..."
                              type="text"
                              className="input input-bordered flex-1"
                            />
                            <button className="btn">Sử dụng</button>
                          </div>
                          {coupons.length === 0 ? (
                            <p className="font-bold italic text-sky-700 mt-4">
                              Không có mã giảm giá phù hợp!
                            </p>
                          ) : (
                            <div className="flex flex-col gap-2 mt-4">
                              <div
                                onClick={() => {
                                  setCouponSelected(null);
                                  document.getElementById("coupon").close();
                                }}
                                className="bg-slate-200 p-2 rounded-md cursor-pointer font-bold"
                              >
                                Không dùng mã
                              </div>
                              {coupons.map((item) => (
                                <div
                                  onClick={() => {
                                    setCouponSelected(item);
                                    document.getElementById("coupon").close();
                                  }}
                                  className="p-2 border rounded-md cursor-pointer"
                                  key={item._id}
                                >
                                  <p className="font-bold text-lg text-sky-700">
                                    {item.name}
                                  </p>
                                  <p className="font-bold">Code: {item.code}</p>
                                  <p>
                                    Giảm:{" "}
                                    {getDiscountText(
                                      item.type,
                                      item.discountAmout
                                    )}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <form method="dialog" className="modal-backdrop">
                        <button>close</button>
                      </form>
                    </dialog>
                  </div>
                  {couponSelected && (
                    <div className="font-bold text-xl flex justify-between">
                      Giảm giá:{" "}
                      <span className="text-red-500">
                        -
                        {getDiscountText(
                          couponSelected.type,
                          couponSelected.discountAmout
                        )}
                      </span>
                    </div>
                  )}
                </div>
                {/* Total */}
                <div className="pt-4">
                  {couponSelected ? (
                    <div className="font-bold text-xl flex justify-between">
                      Tổng tiền:{" "}
                      <span className="text-red-500">
                        {Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(
                          calcDiscount(
                            couponSelected.type,
                            couponSelected.discountAmout,
                            tour?.price?.priceForAdult * numberOfAdults +
                              tour?.price?.priceForChildren * numberOfChildren +
                              tour?.price?.priceForBaby * numberOfBaby
                          )
                        )}
                      </span>
                    </div>
                  ) : (
                    <div className="font-bold text-xl flex justify-between">
                      Tổng tiền:{" "}
                      <span className="text-red-500">
                        {Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(
                          tour?.price?.priceForAdult * numberOfAdults +
                            tour?.price?.priceForChildren * numberOfChildren +
                            tour?.price?.priceForBaby * numberOfBaby
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {/* Button order */}
              <div className="mt-4 float-end">
                <button
                  onClick={() =>
                    handleOrderTour(
                      couponSelected
                        ? calcDiscount(
                            couponSelected.type,
                            couponSelected.discountAmout,
                            tour?.price?.priceForAdult * numberOfAdults +
                              tour?.price?.priceForChildren * numberOfChildren +
                              tour?.price?.priceForBaby * numberOfBaby
                          )
                        : tour?.price?.priceForAdult * numberOfAdults +
                            tour?.price?.priceForChildren * numberOfChildren +
                            tour?.price?.priceForBaby * numberOfBaby,
                      numberOfAdults,
                      numberOfChildren,
                      numberOfBaby
                    )
                  }
                  className="btn btn-primary"
                >
                  Đặt tour
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </Container>
  );
};

export default OrderTour;
