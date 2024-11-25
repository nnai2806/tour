import { Link, useNavigate } from "react-router-dom";
import Container from "../components/Container";
import axios from "axios";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";

import { FaHeart, FaSearch } from "react-icons/fa";
import { updateSuccess } from "../redux/user/userSlice";

// API
const updateUser = async ({ id, formData }) => {
  const res = await axios.put(`/api/user/update/${id}`, formData);
  return res.data;
};

const TourPage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [valueSearch] = useDebounce(searchText, 500);

  // State
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);

  const [valueMin] = useDebounce(min, 500);
  const [valueMax] = useDebounce(max, 500);

  const fetchdTours = async (
    page = 0,
    valueSearch,
    min = 0,
    max = Infinity
  ) => {
    const res = await axios.get(
      `/api/tour/get?page=${page}&search=${valueSearch}&min=${min}&max=${max}`
    );
    return res.data;
  };

  // Fetch data
  const { data } = useQuery({
    queryKey: ["tours", page, valueSearch, valueMin, valueMax],
    queryFn: () =>
      fetchdTours(page, valueSearch, valueMin || 0, valueMax || Infinity),
    placeholderData: keepPreviousData,
  });

  // Mutation
  const updateUserMutate = useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      toast.success("Thao tác thành công!");
      dispatch(updateSuccess(data));
    },
    onError: () => {
      toast.error("Lỗi!");
    },
  });

  const handleFavorite = (tourId) => {
    const tourFavourites = currentUser.tourFavourites || [];
    if (tourFavourites.includes(tourId)) {
      const arr = tourFavourites.filter((id) => id !== tourId);
      updateUserMutate.mutate({
        id: currentUser._id,
        formData: { tourFavourites: arr },
      });
    } else {
      updateUserMutate.mutate({
        id: currentUser._id,
        formData: { tourFavourites: [...tourFavourites, tourId] },
      });
    }
  };

  const handleNextPage = () => {
    if (page === Math.ceil(data?.totaldTours / 9) - 1) {
      return;
    }
    setPage(page + 1);
  };

  const handlePreviousPage = () => {
    if (page === 0) {
      return;
    }
    setPage(page - 1);
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
            <li className="underline">Tour</li>
          </ul>
        </div>

        {/* COupon section */}
        <div>
          <h1 className="text-center text-3xl uppercase font-bold text-sky-600 my-8">
            Tour
          </h1>

          {/* Search */}
          <div className="flex justify-center">
            <label className="input input-bordered w-1/2 flex items-center gap-2 mb-4">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                type="text"
                className="grow"
                placeholder="Tìm kiếm"
              />
              <FaSearch />
            </label>
          </div>

          {/* Filter */}
          <div className="flex items-center justify-center mb-4 w-full">
            <div className="w-1/2 flex items-center justify-between">
              <h1 className="font-bold text-sky-700 text-xl">Lọc theo giá</h1>
              <input
                defaultValue={0}
                onChange={(e) => setMin(e.target.value)}
                min={0}
                className="no-spinner input input-bordered w-40"
                type="number"
                placeholder="Từ"
              />
              <input
                onChange={(e) => setMax(e.target.value)}
                className="no-spinner input input-bordered w-40"
                type="number"
                placeholder="Đến"
              />
            </div>
          </div>

          {/* List tours */}
          <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2">
            {data?.tours.map((item) => (
              <div
                onClick={() => navigate(`/tour/v/${item._id}`)}
                key={item._id}
                className="relative card glass cursor-pointer"
              >
                <div className="absolute bottom-4 left-4 bg-slate-500 p-2 text-white rounded-md">
                  <p>Còn trống: {item.availableSeats}</p>
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!currentUser) {
                      toast.warning("Vui lòng đăng nhập!");
                      return;
                    }
                    handleFavorite(item._id);
                  }}
                  className="absolute bottom-4 right-4"
                >
                  <FaHeart
                    className={`text-4xl hover:text-rose-500 ${
                      currentUser?.tourFavourites?.includes(item._id)
                        ? "text-rose-500"
                        : "text-slate-200"
                    } transition-colors`}
                  />
                </div>
                <figure>
                  <img
                    className="w-full h-56 object-cover rounded-t-xl object-center hover:animate-pulse"
                    src={item?.images[0]}
                    alt="tour"
                  />
                </figure>
                <div className="card-body mb-8">
                  {/* Name */}
                  <p className="text-xl font-bold line-clamp-2">{item.name}</p>
                  <p className="flex justify-between">
                    Giá chỉ từ:{" "}
                    <span className="text-red-500 font-bold">
                      {Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(item.price.priceForAdult)}
                    </span>
                  </p>
                  <div className="text-sky-600 flex flex-col italic text-sm">
                    {/* Description */}
                    <p className="line-clamp-2">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination */}
          {data?.tours.length !== 0 && (
            <div className="join mt-4 flex justify-center">
              <button
                onClick={handlePreviousPage}
                className={`join-item btn ${page === 0 && "btn-disabled"}`}
              >
                «
              </button>
              <button className="join-item btn">
                Trang {page + 1} / {Math.ceil(data?.totalTours / 9)}
              </button>
              <button
                onClick={handleNextPage}
                className={`join-item btn ${
                  page === Math.ceil(data?.totalTours / 9) - 1 && "btn-disabled"
                }`}
              >
                »
              </button>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </Container>
  );
};

export default TourPage;
