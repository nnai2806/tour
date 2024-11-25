import { useEffect, useState } from "react";
import Container from "../components/Container";
import { Link, useLocation } from "react-router-dom";
import LogoImage from "../assets/images/logo.png";
import {
  FaCity,
  FaLocationArrow,
  FaMoneyBillWave,
  FaNewspaper,
  FaUser,
} from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DashUser from "../components/DashboardComponents/DashUser";
import DashDestination from "../components/DashboardComponents/DashDestination";
import DashProvince from "../components/DashboardComponents/DashProvince";
import DashPrice from "../components/DashboardComponents/DashPrice";
import {
  MdAnalytics,
  MdCategory,
  MdRateReview,
  MdSchedule,
  MdTour,
} from "react-icons/md";
import { RiBillFill } from "react-icons/ri";
import DashTourType from "../components/DashboardComponents/DashTourType";
import DashCoupon from "../components/DashboardComponents/DashCoupon";
import { BiSolidCoupon } from "react-icons/bi";
import DashTour from "../components/DashboardComponents/DashTour";
import DashSchedule from "../components/DashboardComponents/DashSchedule";
import DashPost from "../components/DashboardComponents/DashPost";
import DashReviews from "../components/DashboardComponents/DashReviews";
import DashOrder from "../components/DashboardComponents/DashOrder";
import DashStatic from "../components/DashboardComponents/DashStatic";

const DashboardPage = () => {
  const location = useLocation();
  const [tab, setTab] = useState("user");

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  return (
    <Container>
      <div>
        {/* Breadscrumbs section */}
        <div className="breadcrumbs">
          <ul>
            <li>
              <Link to={"/"}>Trang chủ</Link>
            </li>
            <li className="underline">Dashboard</li>
          </ul>
        </div>

        {/* Dashboard section */}
        <div>
          <h1 className="text-center text-3xl uppercase font-bold text-sky-600 my-8">
            Dashboard
          </h1>
          <div className="flex gap-8 flex-col md:flex-row w-full">
            {/* Menu */}
            <ul className="menu menu-lg bg-base-200 rounded-md md:w-96 shadow-md border py-8">
              <div className="flex flex-col items-center mb-8">
                <div className="avatar cursor-pointer hover:brightness-75">
                  <div className="w-32 border-2 rounded-md shadow-md hover:border-sky-600">
                    <img src={LogoImage} alt="avatar" />
                  </div>
                </div>
              </div>
              {/* Static */}
              <li>
                <Link
                  className={`${tab === "static" && "active"}`}
                  to={"?tab=static"}
                >
                  <MdAnalytics />
                  Thống kê
                </Link>
              </li>
              {/* User */}
              <li>
                <Link
                  className={`${tab === "user" && "active"}`}
                  to={"?tab=user"}
                >
                  <FaUser />
                  Người dùng
                </Link>
              </li>
              {/* Destination */}
              <li>
                <Link
                  className={`${tab === "destination" && "active"}`}
                  to={"?tab=destination"}
                >
                  <FaLocationArrow />
                  Điểm đến
                </Link>
              </li>
              {/* Province */}
              <li>
                <Link
                  className={`${tab === "province" && "active"}`}
                  to={"?tab=province"}
                >
                  <FaCity />
                  Tỉnh, thành phố
                </Link>
              </li>
              {/* Price */}
              <li>
                <Link
                  className={`${tab === "price" && "active"}`}
                  to={"?tab=price"}
                >
                  <FaMoneyBillWave />
                  Giá dịch vụ
                </Link>
              </li>
              {/* Tour type */}
              <li>
                <Link
                  className={`${tab === "tourType" && "active"}`}
                  to={"?tab=tourType"}
                >
                  <MdCategory />
                  Thể loại tour
                </Link>
              </li>
              {/* Coupon */}
              <li>
                <Link
                  className={`${tab === "coupon" && "active"}`}
                  to={"?tab=coupon"}
                >
                  <BiSolidCoupon />
                  Khuyến mãi
                </Link>
              </li>
              {/* Tour */}
              <li>
                <Link
                  className={`${tab === "tour" && "active"}`}
                  to={"?tab=tour"}
                >
                  <MdTour />
                  Tour
                </Link>
              </li>
              {/* Schedule */}
              <li>
                <Link
                  className={`${tab === "schedule" && "active"}`}
                  to={"?tab=schedule"}
                >
                  <MdSchedule />
                  Lịch trình
                </Link>
              </li>
              {/* Post */}
              <li>
                <Link
                  className={`${tab === "post" && "active"}`}
                  to={"?tab=post"}
                >
                  <FaNewspaper />
                  Bài viết
                </Link>
              </li>
              {/* Reviews */}
              <li>
                <Link
                  className={`${tab === "reviews" && "active"}`}
                  to={"?tab=reviews"}
                >
                  <MdRateReview />
                  Đánh giá
                </Link>
              </li>
              {/* Order */}
              <li>
                <Link
                  className={`${tab === "order" && "active"}`}
                  to={"?tab=order"}
                >
                  <RiBillFill />
                  Đơn hàng
                </Link>
              </li>
            </ul>
            {/* Display content each menu */}
            <div className="w-full">
              {/* Dash static */}
              {tab === "static" && <DashStatic />}
              {/* Dash user */}
              {tab === "user" && <DashUser />}
              {/* Dash destination */}
              {tab === "destination" && <DashDestination />}
              {/* Dash province */}
              {tab === "province" && <DashProvince />}
              {/* Dash price */}
              {tab === "price" && <DashPrice />}
              {/* Dash tourType */}
              {tab === "tourType" && <DashTourType />}
              {/* Dash coupon */}
              {tab === "coupon" && <DashCoupon />}
              {/* Dash tour */}
              {tab === "tour" && <DashTour />}
              {/* Dash schedule */}
              {tab === "schedule" && <DashSchedule />}
              {/* Dash post */}
              {tab === "post" && <DashPost />}
              {/* Dash reviews */}
              {tab === "reviews" && <DashReviews />}
              {/* Dash order */}
              {tab === "order" && <DashOrder />}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-center" />
    </Container>
  );
};

export default DashboardPage;
