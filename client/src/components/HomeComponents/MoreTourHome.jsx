import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { FaHeart } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateSuccess } from "../../redux/user/userSlice";

// API
const updateUser = async ({ id, formData }) => {
  const res = await axios.put(`/api/user/update/${id}`, formData);
  return res.data;
};

const MoreTourHome = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const fetchTours = async (page = 0) => {
    const res = await axios.get(
      `/api/tour/get?page=${page}&isOutstanding=false`
    );
    return res.data;
  };

  // Fetch data
  const { data } = useQuery({
    queryKey: ["tours-more", page],
    queryFn: () => fetchTours(page),
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
    if (page === Math.ceil(data?.totalTours / 9) - 1) {
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
    <div className="mt-10">
      {/* Title */}
      <h1 className="uppercase text-sky-600 text-2xl my-2 font-bold">
        Tour khác
      </h1>
      {/* List tours */}
      <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2">
        {data?.tours.map((item) => (
          <div
            onClick={() => navigate(`/tour/v/${item._id}`)}
            key={item._id}
            className="card glass hover:brightness-75 cursor-pointer"
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
      <ToastContainer />
    </div>
  );
};

export default MoreTourHome;
