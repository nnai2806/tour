import { Link, useNavigate } from "react-router-dom";
import Container from "../components/Container";
import axios from "axios";
import { useDebounce } from "use-debounce";
import { useState } from "react";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { IoTime } from "react-icons/io5";
import moment from "moment";
import PostImg from "../assets/images/post.png";
import { FaHeart, FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { updateSuccess } from "../redux/user/userSlice";

// API
const updateUser = async ({ id, formData }) => {
  const res = await axios.put(`/api/user/update/${id}`, formData);
  return res.data;
};

const NewsPage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [valueSearch] = useDebounce(searchText, 500);

  const fetchPosts = async (page = 0, valueSearch) => {
    const res = await axios.get(
      `/api/post/get?page=${page}&search=${valueSearch}`
    );
    return res.data;
  };

  // Fetch data
  const { data } = useQuery({
    queryKey: ["posts", page, valueSearch],
    queryFn: () => fetchPosts(page, valueSearch),
    placeholderData: keepPreviousData,
  });

  const handleNextPage = () => {
    if (page === Math.ceil(data?.totalPosts / 9) - 1) {
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

  const handleFavorite = (postId) => {
    const postFavourites = currentUser.postFavourites || [];
    if (postFavourites.includes(postId)) {
      const arr = postFavourites.filter((id) => id !== postId);
      updateUserMutate.mutate({
        id: currentUser._id,
        formData: { postFavourites: arr },
      });
    } else {
      updateUserMutate.mutate({
        id: currentUser._id,
        formData: { postFavourites: [...postFavourites, postId] },
      });
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
            <li className="underline">Tin tức</li>
          </ul>
        </div>

        {/* Destination section */}
        <div>
          <h1 className="text-center text-3xl uppercase font-bold text-sky-600 my-8">
            Tin tức du lịch
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
          {/* List posts */}
          <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2">
            {data?.posts.map((item) => (
              <div
                onClick={() => navigate(`/post/v/${item._id}`)}
                key={item._id}
                className="relative card glass hover:brightness-75 cursor-pointer"
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
                      currentUser?.postFavourites?.includes(item._id)
                        ? "text-rose-500"
                        : "text-slate-200"
                    } transition-colors`}
                  />
                </div>
                <figure>
                  <img
                    className="w-full h-56 object-cover object-center hover:animate-pulse"
                    src={item?.image === "img" ? PostImg : item?.image}
                    alt="post"
                  />
                </figure>
                <div className="card-body mb-8">
                  <h2 className="card-title line-clamp-2">{item.title}</h2>
                  <div className="text-sky-600 flex justify-between italic text-sm">
                    {/* Author */}
                    <p>Tác giả: {item.user?.fullName}</p>
                    {/* Created at */}
                    <p className="flex items-center gap-2">
                      <IoTime />
                      {moment(item.createdAt).format("DD/MM/yyyy HH:ss")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination */}
          {data?.posts.length !== 0 && (
            <div className="join mt-4 flex justify-center">
              <button
                onClick={handlePreviousPage}
                className={`join-item btn ${page === 0 && "btn-disabled"}`}
              >
                «
              </button>
              <button className="join-item btn">
                Trang {page + 1} / {Math.ceil(data?.totalPosts / 9)}
              </button>
              <button
                onClick={handleNextPage}
                className={`join-item btn ${
                  page === Math.ceil(data?.totalPosts / 9) - 1 && "btn-disabled"
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

export default NewsPage;
