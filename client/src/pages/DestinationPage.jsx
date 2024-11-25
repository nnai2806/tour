import { Link, useNavigate } from "react-router-dom";
import Container from "../components/Container";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import axios from "axios";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { FaHeart, FaSearch } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { updateSuccess } from "../redux/user/userSlice";

// API
const updateUser = async ({ id, formData }) => {
  const res = await axios.put(`/api/user/update/${id}`, formData);
  return res.data;
};

const DestinationPage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [valueSearch] = useDebounce(searchText, 500);

  const fetchDestinations = async (page = 0, valueSearch) => {
    const res = await axios.get(
      `/api/destination/get?page=${page}&search=${valueSearch}`
    );
    return res.data;
  };

  // Fetch data
  const { data } = useQuery({
    queryKey: ["destinations", page, valueSearch],
    queryFn: () => fetchDestinations(page, valueSearch),
    placeholderData: keepPreviousData,
  });

  const handleNextPage = () => {
    if (page === Math.ceil(data?.totalDestinations / 9) - 1) {
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

  const handleFavorite = (destinationId) => {
    const destinationFavourites = currentUser.destinationFavourites || [];
    if (destinationFavourites.includes(destinationId)) {
      const arr = destinationFavourites.filter((id) => id !== destinationId);
      updateUserMutate.mutate({
        id: currentUser._id,
        formData: { destinationFavourites: arr },
      });
    } else {
      updateUserMutate.mutate({
        id: currentUser._id,
        formData: {
          destinationFavourites: [...destinationFavourites, destinationId],
        },
      });
    }
  };

  console.log(currentUser);

  return (
    <Container>
      <div>
        {/* Breadscrumbs section */}
        <div className="breadcrumbs">
          <ul>
            <li>
              <Link to={"/"}>Trang chủ</Link>
            </li>
            <li className="underline">Điểm đến</li>
          </ul>
        </div>

        {/* Destination section */}
        <div>
          {/* Title */}
          <h1 className="text-center text-3xl uppercase font-bold text-sky-600 my-8">
            Điểm đến du lịch
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
          {/* List destinations */}
          <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2">
            {data?.destinations.map((item) => (
              <div
                onClick={() => navigate(`/destination/v/${item._id}`)}
                key={item._id}
                className="relative card glass cursor-pointer"
              >
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
                      currentUser?.destinationFavourites?.includes(item._id)
                        ? "text-rose-500"
                        : "text-slate-200"
                    } transition-colors`}
                  />
                </div>
                <figure>
                  <img
                    className="w-full h-56 object-cover object-center hover:animate-pulse"
                    src={item?.images[0]}
                    alt="destination"
                  />
                </figure>
                <div className="card-body mb-8">
                  <h2 className="card-title line-clamp-2">{item.title}</h2>
                  {/* Name */}
                  <p className="text-xl font-bold line-clamp-2">{item.name}</p>
                  <div className="text-sky-600 flex flex-col italic text-sm">
                    {/* Province */}
                    <p className="text-rose-600">{item.province.name}</p>
                    {/* Description */}
                    <p className="line-clamp-2">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination */}
          {data?.destinations.length !== 0 && (
            <div className="join mt-4 flex justify-center">
              <button
                onClick={handlePreviousPage}
                className={`join-item btn ${page === 0 && "btn-disabled"}`}
              >
                «
              </button>
              <button className="join-item btn">
                Trang {page + 1} / {Math.ceil(data?.totalDestinations / 9)}
              </button>
              <button
                onClick={handleNextPage}
                className={`join-item btn ${
                  page === Math.ceil(data?.totalDestinations / 9) - 1 &&
                  "btn-disabled"
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

export default DestinationPage;
