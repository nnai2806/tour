import { Link, useNavigate } from "react-router-dom";
import LogoImage from "../assets/images/logo.png";
import AvatarImage from "../assets/images/avatar.png";
import { HiMenuAlt2 } from "react-icons/hi";
import { FaWindowClose } from "react-icons/fa";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { signoutSuccess } from "../redux/user/userSlice";

const pages = [
  { key: 1, page: "Điểm đến", to: "/diem-den" },
  { key: 2, page: "Tour", to: "/tour" },
  { key: 3, page: "Tin tức", to: "/tin-tuc" },
  { key: 4, page: "Khu vực", to: "/khu-vuc" },
];

const Header = () => {
  const navRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/signout");
      dispatch(signoutSuccess());
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="z-20 flex justify-center bg-base-100 shadow-md w-full fixed top-0 bg-opacity-90">
      <div className="flex w-[1200px] mx-6 items-center justify-between">
        <div className="drawer block md:hidden w-fit">
          <input
            ref={navRef}
            id="nav-drawer"
            type="checkbox"
            className="drawer-toggle"
          />
          <div className="drawer-content">
            <div
              onClick={() => navRef.current.click()}
              className="drawer-button text-5xl p-2 hover:bg-slate-100 hover:text-sky-600 rounded-md cursor-pointer"
            >
              <HiMenuAlt2 />
            </div>
          </div>
          <div className="drawer-side z-10">
            <label
              htmlFor="nav-drawer"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <ul className="menu bg-base-100 text-slate-900 min-h-full w-60 p-4">
              {/* Button close */}
              <button
                onClick={() => navRef.current.click()}
                className="text-4xl flex justify-end border-b-2 pb-4 hover:text-sky-600"
              >
                <FaWindowClose />
              </button>
              {/* Sidebar content here */}
              {pages.map((item) => (
                <Link key={item.key} to={item.to}>
                  <li
                    onClick={() => navRef.current.click()}
                    className="hover:bg-slate-100 rounded-md p-4 mt-2 font-bold text-xl hover:text-sky-600"
                  >
                    {item.page}
                  </li>
                </Link>
              ))}
            </ul>
          </div>
        </div>

        <Link to={"/"} className="flex items-center">
          <img
            className="p-4 rounded-3xl"
            width={100}
            src={LogoImage}
            alt="Logo image"
          />
          <span className="font-bold md:text-3xl text-xl font-serif text-sky-700">
            Travel Việt
          </span>
        </Link>

        <ul className="hidden md:flex">
          {pages.map((item) => (
            <Link key={item.key} to={item.to}>
              <li className="p-4 font-bold text-xl hover:text-sky-600">
                {item.page}
              </li>
            </Link>
          ))}
        </ul>

        {currentUser ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="avatar">
              <div className="w-14 ml-4 rounded-full hover:outline outline-sky-600">
                <img
                  alt="Avatar image"
                  src={currentUser.image || AvatarImage}
                />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow-md"
            >
              <li className="p-2 text-sm font-bold text-sky-600 border-b-2">
                Người dùng: <br /> {currentUser.fullName}
              </li>
              <Link to={"/profile"}>
                <li className="p-2 text-sm font-bold hover:bg-slate-100 hover:text-sky-600 rounded-md">
                  Tài khoản
                </li>
              </Link>
              {currentUser.isAdmin && (
                <Link to={"/dashboard"}>
                  <li className="p-2 text-sm font-bold hover:bg-slate-100 hover:text-sky-600 rounded-md">
                    Dashboard
                  </li>
                </Link>
              )}
              <li
                onClick={handleLogout}
                className="p-2 text-sm font-bold hover:bg-slate-100 hover:text-sky-600 rounded-md underline text-rose-500 cursor-pointer"
              >
                Đăng xuất
              </li>
            </ul>
          </div>
        ) : (
          <Link to={"/login"}>
            <button className="btn btn-outline ml-4">Đăng nhập</button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Header;
