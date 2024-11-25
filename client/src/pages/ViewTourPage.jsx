import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Container from "../components/Container";
import ImageGallery from "../components/ImageGallery";
import moment from "moment";
import { FaHeart, FaStar } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateSuccess } from "../redux/user/userSlice";
import { FaLocationDot } from "react-icons/fa6";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const formatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  minimumFractionDigits: 0,
});

// API
const updateUser = async ({ id, formData }) => {
  const res = await axios.put(`/api/user/update/${id}`, formData);
  return res.data;
};

const addReview = async (formData) => {
  const res = await axios.post(`/api/reviews/create`, formData);
  return res.data;
};

const getReviewsOfTour = async (tourId, page = 0) => {
  const res = await axios.get(`/api/reviews/get?tour=${tourId}&page=${page}`);
  return res.data;
};

const ViewTourPage = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tourId } = useParams();
  const [tour, setTour] = useState(null);
  const [otherTours, setOtherTours] = useState([]);
  const [tourImages, setTourImages] = useState([]);
  const [scheduleDetails, setScheduleDetails] = useState([]);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(false);
  const [locationLatLng, setLocationLatLng] = useState([]);
  const [centreLocationLatLng, setCentreLocationLatLng] = useState(null);

  const getScheduleDetailById = async (id) => {
    try {
      const res = await axios.get(`/api/scheduleDetail/get?id=${id}`);
      return res.data.scheduleDetails[0];
    } catch (error) {
      console.error("Error fetching scheduleDetail:", error);
    }
  };

  const getAllScheduleDetails = async (scheduleDetailIds) => {
    try {
      const scheduleDetails = await Promise.all(
        scheduleDetailIds.map((id) => getScheduleDetailById(id))
      );
      return scheduleDetails;
    } catch (error) {
      console.error("Error fetching all scheduleDetails:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const details = await getAllScheduleDetails(
        tour?.schedule?.scheduleDetail
      );
      setScheduleDetails(details);
    };
    if (tour) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour]);

  // Get all images of this tour
  useEffect(() => {
    let images = [];
    if (tour) {
      tour.destinations.forEach((destination) => {
        images.push(...destination.images);
      });
    }
    setTourImages(images);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour]);

  //  Get other tours
  useEffect(() => {
    const getOtherTours = async () => {
      const res = await axios.get("/api/tour/get?limit=4");
      setOtherTours(res.data.tours);
      setOtherTours((prev) => prev.filter((item) => item._id !== tourId));
    };
    if (tourId) {
      getOtherTours();
    }
  }, [tourId]);

  // Get tour
  useEffect(() => {
    const getTourById = async () => {
      const res = await axios.get(`/api/tour/get?id=${tourId}`);
      setTour(res.data.tours[0]);
    };
    if (tourId) {
      getTourById();
    }
  }, [tourId]);

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

  // Locaiton
  const fetchLatLng = async (locationName) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      locationName
    )}&format=json`;
    const response = await axios.get(url);
    const results = response.data;

    if (results.length > 0) {
      const { lat, lon } = results[0];
      return { lat: parseFloat(lat), lng: parseFloat(lon) };
    } else {
      throw new Error(`Không tìm thấy tọa độ cho: ${locationName}`);
    }
  };

  const getLocationsWithLatLng = async () => {
    const updatedLocations = [];
    setLoading(true);
    for (const location of tour.destinations) {
      try {
        const { lat, lng } = await fetchLatLng(location.name);
        updatedLocations.push({ name: location.name, lat, lng });
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    }
    setLocationLatLng(updatedLocations);
  };

  // Hàm tìm tọa độ trung tâm
  const fetchCenterCoordinates = async (locationName) => {
    setLoading(true);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      locationName
    )}&format=json&limit=1`;

    try {
      const response = await axios.get(url);
      const results = response.data;

      if (results.length > 0) {
        const { display_name, lat, lon } = results[0];
        setCentreLocationLatLng({
          name: display_name,
          lat: parseFloat(lat),
          lng: parseFloat(lon),
        });
      } else {
        console.warn(`Không tìm thấy địa điểm cho tên: ${locationName}`);
        setCentreLocationLatLng(null);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error.message);
      setCentreLocationLatLng(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tour) {
      getLocationsWithLatLng();
      fetchCenterCoordinates(tour.destinations[0].province.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour]);

  // Mutaiotioa
  const createReviewMutatate = useMutation({
    mutationFn: addReview,
    onSuccess: () => {
      toast.success("Đánh giá thành công!");
      queryClient.invalidateQueries("reviews");
    },
    onError: () => {
      toast.error("Lỗi!");
    },
  });

  const reviewQuery = useQuery({
    queryKey: ["reviews", tourId, page],
    queryFn: () => getReviewsOfTour(tourId, page),
  });

  const handleNextPage = () => {
    if (page === Math.ceil(reviewQuery?.totalReviewss / 9) - 1) {
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
            <li className="underline">{tour?.name}</li>
          </ul>
        </div>
        {/* Content destionation section */}
        <div>
          {/* Name */}
          <h1 className="text-center text-3xl font-bold my-10">{tour?.name}</h1>
          {/* Description */}
          <p>{tour?.description}</p>
          {/* Images */}
          <div>
            <ImageGallery images={tourImages} />
          </div>
          {/* Destinations */}
          <div className="flex flex-col gap-2 text-xl mt-10">
            <strong className="text-sky-600">Các điểm đến tham quan: </strong>
            <div className="flex flex-wrap gap-2">
              {tour?.destinations?.map((item) => (
                <p
                  onClick={() => navigate(`/destination/v/${item._id}`)}
                  className="p-2 bg-sky-600 rounded-md w-fit text-white cursor-pointer hover:bg-sky-800"
                  key={item._id}
                >
                  {item?.name}
                </p>
              ))}
            </div>
          </div>
          {/* Date */}
          <div className="flex gap-2 text-xl mt-10">
            <p className="font-bold text-sky-600">Thời gian:</p>
            <p className="text-rose-600">
              Ngày khởi hành:{" "}
              <strong>{moment(tour?.startDate).format("DD/MM/yyyy")}</strong> -
              Ngày kết thúc:{" "}
              <strong>{moment(tour?.endDate).format("DD/MM/yyyy")}</strong>
            </p>
          </div>
          {/* Location */}
          <div className="flex gap-2 text-xl mt-10 items-center">
            <p className="font-bold text-sky-600">Vị trí:</p>
            <button
              onClick={() => {
                if (!loading) {
                  document.getElementById("map-detail").showModal();
                }
              }}
              className="btn btn-info"
            >
              <FaLocationDot className="text-xl text-rose-500" />
            </button>
          </div>
          {/* Prices */}
          <div className="flex gap-2 text-xl mt-10">
            <strong className="text-sky-600">Giá: </strong>
            {`Người lớn: ${formatter.format(
              tour?.price.priceForAdult
            )} | Trẻ em: ${formatter.format(
              tour?.price.priceForChildren
            )} | Em bé: ${formatter.format(tour?.price.priceForBaby)}`}
          </div>
          {/* Start destination */}
          <div className="flex gap-2 text-xl mt-10">
            <strong className="text-sky-600">Điểm bắt đầu: </strong>
            {tour?.startDestination?.name}
          </div>
          {/* Vehicle */}
          <div className="flex gap-2 text-xl mt-10">
            <strong className="text-sky-600">Phương tiện: </strong>
            {tour?.vehicle}
          </div>
          {/* Schedule */}
          <div className="flex flex-col gap-2 text-xl mt-10">
            <strong className="text-sky-600">Lịch trình: </strong>
            <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
              {scheduleDetails !== undefined &&
                scheduleDetails.map((item) => (
                  <div key={item._id} className="collapse bg-base-200 mb-2">
                    <input type="checkbox" />
                    <div className="collapse-title text-xl font-medium">
                      {item.name}
                    </div>
                    <div className="collapse-content">
                      <p className="border-l-8 border-sky-600 p-2">
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}
            </ul>
          </div>
          {/* Booking button */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => navigate(`/order/${tourId}`)}
              className="btn btn-primary btn-lg"
            >
              Đặt tour
            </button>
          </div>
        </div>

        {/* Other tours */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-sky-600 py-4">
            Các tour khác
          </h2>
          {/* List tours */}
          <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-4">
            {otherTours.map((item) => (
              <div
                onClick={() => navigate(`/tour/v/${item._id}`)}
                key={item._id}
                className="card glass cursor-pointer overflow-hidden"
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
                    className="w-full h-56 object-cover object-center hover:animate-pulse"
                    src={item?.images[0]}
                    alt="tour"
                  />
                </figure>
                <div className="card-body mb-8">
                  <h2 className="card-title line-clamp-2">{item.title}</h2>
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
        </div>

        {/* Reviews */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-sky-600 py-4">Đánh giá</h2>
          {currentUser ? (
            <div className="flex justify-center items-end gap-4">
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="rating flex gap-4">
                  <input
                    onChange={(e) => setRating(e.target.value)}
                    type="radio"
                    name="rating-tour"
                    value={1}
                    className="mask mask-star-2 bg-orange-400 w-10 h-10"
                  />
                  <input
                    onChange={(e) => setRating(e.target.value)}
                    type="radio"
                    name="rating-tour"
                    className="mask mask-star-2 bg-orange-400 w-10 h-10"
                    value={2}
                  />
                  <input
                    onChange={(e) => setRating(e.target.value)}
                    type="radio"
                    name="rating-tour"
                    className="mask mask-star-2 bg-orange-400 w-10 h-10"
                    value={3}
                  />
                  <input
                    onChange={(e) => setRating(e.target.value)}
                    type="radio"
                    name="rating-tour"
                    className="mask mask-star-2 bg-orange-400 w-10 h-10"
                    value={4}
                  />
                  <input
                    onChange={(e) => setRating(e.target.value)}
                    type="radio"
                    name="rating-tour"
                    className="mask mask-star-2 bg-orange-400 w-10 h-10"
                    value={5}
                    defaultChecked
                  />
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="textarea textarea-bordered w-full"
                  placeholder="Nhập đánh giá..."
                ></textarea>
              </div>
              <button
                onClick={() => {
                  if (!content || content === "") {
                    toast.warning("Vui lòng nhập nội dung đánh giá!");
                    return;
                  }
                  createReviewMutatate.mutate({
                    user: currentUser._id,
                    tour: tourId,
                    quantityStar: rating,
                    content: content,
                  });
                  setContent("");
                }}
                className="btn btn-info"
              >
                Gửi
              </button>
            </div>
          ) : (
            <p>Vui lòng đăng nhập để đánh giá!</p>
          )}
          <div className="mt-4 flex flex-col gap-4">
            {!reviewQuery.isLoading &&
              reviewQuery.data.reviews.map((item) => (
                <div className="border p-4" key={item._id}>
                  <div className="flex justify-between border-b-2 pb-2 items-center">
                    <div className="flex gap-4">
                      <div className="avatar">
                        <div className="w-12 rounded-full">
                          <img src={item.user.image} />
                        </div>
                      </div>
                      <div>
                        <p className="font-bold">{item.user.fullName}</p>
                        <p>{moment(item.createdAt).format("DD/MM/yyyy")}</p>
                      </div>
                    </div>
                    <div className="flex text-xl gap-2 text-yellow-500">
                      {item.quantityStar} <FaStar className="mt-[3px]" />
                    </div>
                  </div>
                  <p className="p-4">{item.content}</p>
                </div>
              ))}
            {/* Pagination */}
            {!reviewQuery.isLoading &&
              reviewQuery.data.reviews.length !== 0 && (
                <div className="join mt-4 flex justify-center">
                  <button
                    onClick={handlePreviousPage}
                    className={`join-item btn ${page === 0 && "btn-disabled"}`}
                  >
                    «
                  </button>
                  <button className="join-item btn">
                    Trang {page + 1} /{" "}
                    {Math.ceil(reviewQuery.data.totalReviewss / 9)}
                  </button>
                  <button
                    onClick={handleNextPage}
                    className={`join-item btn ${
                      page ===
                        Math.ceil(reviewQuery.data.totalReviewss / 9) - 1 &&
                      "btn-disabled"
                    }`}
                  >
                    »
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>
      <ToastContainer />

      {/* Modal show map */}
      <dialog id="map-detail" className="modal">
        <div className="modal-box w-11/12 max-w-5xl">
          <h3 className="font-bold text-lg text-sky-700">
            Bản đồ: {tour?.name}
          </h3>
          <div className="py-4">
            <div className="">
              {centreLocationLatLng && (
                <MapContainer
                  center={[centreLocationLatLng.lat, centreLocationLatLng.lng]} // Tọa độ trung tâm
                  zoom={13} // Mức phóng to
                  style={{ height: "500px", width: "100%" }}
                >
                  {/* TileLayer để hiển thị bản đồ */}
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {/* Hiển thị các Marker */}
                  {locationLatLng.map((location, index) => (
                    <Marker key={index} position={[location.lat, location.lng]}>
                      <Popup>{location.name}</Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </div>
          </div>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button, it will close the modal */}
              <button className="btn">Đóng</button>
            </form>
          </div>
        </div>
      </dialog>
    </Container>
  );
};

export default ViewTourPage;
