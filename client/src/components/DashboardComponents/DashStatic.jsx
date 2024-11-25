import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { format } from "date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashStatic = () => {
  const [totalPrice, setTotalPrice] = useState(0);
  const [data, setData] = useState(null);

  // API
  const getUsers = async () => {
    const res = await axios.get("/api/user/get");
    return res.data;
  };
  const getDestinations = async () => {
    const res = await axios.get("/api/destination/get");
    return res.data;
  };
  const getProvinces = async () => {
    const res = await axios.get("/api/province/get");
    return res.data;
  };
  const getTours = async () => {
    const res = await axios.get("/api/tour/get");
    return res.data;
  };
  const getPosts = async () => {
    const res = await axios.get("/api/post/get");
    return res.data;
  };
  const getReviews = async () => {
    const res = await axios.get("/api/reviews/get");
    return res.data;
  };
  const getCoupons = async () => {
    const res = await axios.get("/api/coupon/get");
    return res.data;
  };
  const getOrders = async () => {
    const res = await axios.get("/api/order/get?limit=1000");
    return res.data;
  };

  // Query
  const userQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(),
  });
  const destinationQuery = useQuery({
    queryKey: ["destinations"],
    queryFn: () => getDestinations(),
  });
  const provinceQuery = useQuery({
    queryKey: ["provinces"],
    queryFn: () => getProvinces(),
  });
  const tourQuery = useQuery({
    queryKey: ["tours"],
    queryFn: () => getTours(),
  });
  const postQuery = useQuery({
    queryKey: ["posts"],
    queryFn: () => getPosts(),
  });
  const reviewQuery = useQuery({
    queryKey: ["reviews"],
    queryFn: () => getReviews(),
  });
  const couponQuery = useQuery({
    queryKey: ["coupons"],
    queryFn: () => getCoupons(),
  });
  const orderQuery = useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrders(),
  });

  useEffect(() => {
    if (orderQuery.data) {
      const total = orderQuery.data.orders.reduce((sum, item) => {
        return item.status === "Đã thanh toán" ? sum + item.totalPrice : sum;
      }, 0);
      setTotalPrice(total);
    }
  }, [orderQuery.data]);

  useEffect(() => {
    if (orderQuery.data) {
      const data = {
        labels: orderQuery.data.orders
          .filter((order) => order.status === "Đã thanh toán") // Lọc các đơn "Đã thanh toán"
          .map((order) => format(new Date(order.createdAt), "dd/MM/yyyy")), // Lấy ngày cho nhãn (labels)
        datasets: [
          {
            label: "Tổng giá trị đơn hàng (VND)", // Nhãn biểu đồ
            data: orderQuery.data.orders
              .filter((order) => order.status === "Đã thanh toán") // Chỉ lấy đơn "Đã thanh toán"
              .map((order) => order.totalPrice), // Tổng giá trị đơn hàng (trục Y)
            backgroundColor: "rgba(75, 192, 192, 0.5)", // Màu cột
            borderColor: "rgba(75, 192, 192, 1)", // Màu viền
            borderWidth: 1, // Độ dày viền
          },
        ],
      };
      setData(data);
    }
  }, [orderQuery.data]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top", // Vị trí chú thích
      },
      title: {
        display: true,
        text: "Doanh thu theo đơn đặt hàng", // Tiêu đề biểu đồ
      },
    },
  };

  return (
    <div>
      <div className="stats shadow mb-4">
        <div className="stat">
          <div className="stat-title text-primary">Tổng doanh thu</div>
          <div className="stat-value text-secondary">
            {Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(totalPrice)}
          </div>
        </div>
      </div>
      <div className="my-4 flex justify-center">
        {data && <Bar data={data} options={options} />}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {!userQuery.isLoading && (
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Người dùng</div>
              <div className="stat-value">{userQuery.data.totalUsers}</div>
              <div className="stat-desc">
                {userQuery.data.lastMonthUsers || 0} người dùng từ tháng trước
              </div>
            </div>
          </div>
        )}
        {!destinationQuery.isLoading && (
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Điểm đến</div>
              <div className="stat-value">
                {destinationQuery.data.totalDestinations}
              </div>
              <div className="stat-desc">
                {destinationQuery.data.lastMonthDestinations || 0} điểm đến từ
                tháng trước
              </div>
            </div>
          </div>
        )}
        {!provinceQuery.isLoading && (
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Tỉnh, thành phố</div>
              <div className="stat-value">
                {provinceQuery.data.totalProvinces}
              </div>
              <div className="stat-desc">
                {provinceQuery.data.lastMonthProvinces || 0} tỉnh, thành phố từ
                tháng trước
              </div>
            </div>
          </div>
        )}
        {!tourQuery.isLoading && (
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Tour</div>
              <div className="stat-value">{tourQuery.data.totalTours}</div>
              <div className="stat-desc">
                {tourQuery.data.lastMonthTours || 0} tour từ tháng trước
              </div>
            </div>
          </div>
        )}
        {!postQuery.isLoading && (
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Bài viết</div>
              <div className="stat-value">{postQuery.data.totalPosts}</div>
              <div className="stat-desc">
                {postQuery.data.lastMonthPosts || 0} bài viết từ tháng trước
              </div>
            </div>
          </div>
        )}
        {!reviewQuery.isLoading && (
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Đánh giá</div>
              <div className="stat-value">{reviewQuery.data.totalReviewss}</div>
              <div className="stat-desc">
                {reviewQuery.data.lastMonthReviewss || 0} đánh giá từ tháng
                trước
              </div>
            </div>
          </div>
        )}
        {!couponQuery.isLoading && (
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Khuyến mãi</div>
              <div className="stat-value">{couponQuery.data.totalCoupons}</div>
              <div className="stat-desc">
                {couponQuery.data.lastMonthCoupons || 0} khuyến mãi từ tháng
                trước
              </div>
            </div>
          </div>
        )}
        {!orderQuery.isLoading && (
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Đơn hàng</div>
              <div className="stat-value">{orderQuery.data.totalOrders}</div>
              <div className="stat-desc">
                {orderQuery.data.lastMonthOrders || 0} đơn hàng từ tháng trước
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashStatic;
