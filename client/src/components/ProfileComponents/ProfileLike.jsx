import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { updateSuccess } from "../../redux/user/userSlice";

// API
const updateUser = async ({ id, formData }) => {
  const res = await axios.put(`/api/user/update/${id}`, formData);
  return res.data;
};

const ProfileLike = () => {
  let stt = 0;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [favouriteTours, setFavouriteTours] = useState([]);
  const [destinationFavourites, setDestinationFavourites] = useState([]);
  const [postFavourites, setPostFavourites] = useState([]);

  // Get user by userID
  useEffect(() => {
    const getUserById = async (userId) => {
      const res = await axios.get(`/api/user/get?id=${userId}`);
      setFavouriteTours(res.data.users[0].tourFavourites);
      setDestinationFavourites(res.data.users[0].destinationFavourites);
      setPostFavourites(res.data.users[0].postFavourites);
    };
    if (currentUser._id) {
      getUserById(currentUser._id);
    }
  }, [currentUser]);

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

  const handleFavorite = (tourId, key) => {
    const list = currentUser[key] || [];
    if (list.includes(tourId)) {
      const arr = list.filter((id) => id !== tourId);
      updateUserMutate.mutate({
        id: currentUser._id,
        formData: { [key]: arr },
      });
    } else {
      updateUserMutate.mutate({
        id: currentUser._id,
        formData: { [key]: [...list, tourId] },
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Tour */}
      <div className="border p-4 rounded-md">
        <h1
          id="info"
          className="text-xl font-bold pb-4 border-b-2 text-sky-600"
        >
          Tour yêu thích
        </h1>
        {/* Tour */}
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên tour</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {favouriteTours.map((item) => (
                <tr key={item._id}>
                  <th>{++stt}</th>
                  <td className="font-bold text-sky-700">{item.name}</td>
                  <td className="flex flex-wrap gap-1 justify-end">
                    <button
                      onClick={() => navigate(`/tour/v/${item._id}`)}
                      className="btn text-white btn-sm btn-info"
                    >
                      Xem
                    </button>
                    <button
                      onClick={() => handleFavorite(item._id, "tourFavourites")}
                      className="btn text-white btn-sm btn-error"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {favouriteTours.length === 0 && (
            <p className="text-xl font-bold text-slate-400 p-5 text-center">
              Dữ liệu rỗng
            </p>
          )}
        </div>
      </div>
      {/* Destination */}
      <div className="border p-4 rounded-md">
        <h1
          id="info"
          className="text-xl font-bold pb-4 border-b-2 text-sky-600"
        >
          Điểm đến yêu thích
        </h1>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên điểm đến</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {destinationFavourites.map((item) => (
                <tr key={item._id}>
                  <th>{++stt}</th>
                  <td className="font-bold text-sky-700">{item.name}</td>
                  <td className="flex flex-wrap gap-1 justify-end">
                    <button
                      onClick={() => navigate(`/destination/v/${item._id}`)}
                      className="btn text-white btn-sm btn-info"
                    >
                      Xem
                    </button>
                    <button
                      onClick={() =>
                        handleFavorite(item._id, "destinationFavourites")
                      }
                      className="btn text-white btn-sm btn-error"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {destinationFavourites.length === 0 && (
            <p className="text-xl font-bold text-slate-400 p-5 text-center">
              Dữ liệu rỗng
            </p>
          )}
        </div>
      </div>
      {/* Post */}
      <div className="border p-4 rounded-md">
        <h1
          id="info"
          className="text-xl font-bold pb-4 border-b-2 text-sky-600"
        >
          Bài viết yêu thích
        </h1>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên bài viết</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {postFavourites.map((item) => (
                <tr key={item._id}>
                  <th>{++stt}</th>
                  <td className="font-bold text-sky-700">{item.title}</td>
                  <td className="flex flex-wrap gap-1 justify-end">
                    <button
                      onClick={() => navigate(`/post/v/${item._id}`)}
                      className="btn text-white btn-sm btn-info"
                    >
                      Xem
                    </button>
                    <button
                      onClick={() => handleFavorite(item._id, "postFavourites")}
                      className="btn text-white btn-sm btn-error"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {postFavourites.length === 0 && (
            <p className="text-xl font-bold text-slate-400 p-5 text-center">
              Dữ liệu rỗng
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileLike;
