import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaPen,
  FaQuestionCircle,
  FaSearch,
} from "react-icons/fa";
import {
  MdChairAlt,
  MdClose,
  MdDateRange,
  MdDescription,
  MdError,
  MdTour,
} from "react-icons/md";
import { useDebounce } from "use-debounce";
import { app } from "../../firebase";

const DashTour = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [listSelected, setListSelected] = useState([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [tour, setTour] = useState(null);
  const [inputModifies, setInputModifies] = useState({});
  const [formDataToUpdate, setFormDataToUpdate] = useState({});
  const [formDataToAdd, setFormDataToAdd] = useState({});
  const [successToast, setSuccessToast] = useState("");
  const [errorToast, setErrorToast] = useState("");
  const [searchText, setSearchText] = useState("");
  const [valueSearch] = useDebounce(searchText, 500);
  const [destinations, setDestinations] = useState([]);
  const [prices, setPrices] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [tourTypes, setTourTypes] = useState([]);

  // States manage input's errors
  const [nameError, setNameError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [destinationsError, setDestinationsError] = useState("");
  const [startDestinationError, setStartDestinationError] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [availableSeatsError, setAvailableSeatsError] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const [vehicleError, setVehicleError] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedOptionsUpdate, setSelectedOptionsUpdate] = useState([]);

  //   State to handle images
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrlFiles, setImageUrlFiles] = useState([]);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [imageUploadSuccess, setImageUploadSuccess] = useState(null);
  const [imageUpdateFiles, setImageUpdateFiles] = useState([]);
  const [imageUpdateUrlFiles, setImageUpdateUrlFiles] = useState([]);
  const [imageUpdateFileUploadProgress, setImageUpdateFileUploadProgress] =
    useState(null);
  const [imageUpdateFileUploading, setImageUpdateFileUploading] =
    useState(false);
  const [imageUpdateUploadSuccess, setImageUpdateUploadSuccess] =
    useState(null);

  useEffect(() => {
    setFormDataToAdd({ ...formDataToAdd, destinations: selectedOptions });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOptions]);
  // ==============================================
  // Method call API
  const fetchTours = async (page = 0, valueSearch) => {
    const res = await axios.get(
      `/api/tour/get?page=${page}&search=${valueSearch}`
    );
    return res.data;
  };

  const addTour = async (formDataToUpdate) => {
    const res = await axios.post("/api/tour/create", formDataToUpdate);
    return res.data;
  };

  const updateTour = async (formDataToUpdate) => {
    const res = await axios.put(
      `/api/tour/update/${tour?._id}`,
      formDataToUpdate
    );
    return res.data;
  };

  const deleteTour = async (id) => {
    await axios.delete(`/api/tour/delete/${id}`);
  };

  const deleteManyTour = async (listId) => {
    await axios.delete("/api/tour/delete", {
      data: { tourIds: listId },
    });
  };
  // ==============================================
  // Hanlde mutation
  const mutationAdd = useMutation({
    mutationFn: addTour,
    onSuccess: () => {
      setSuccessToast("Thêm thành công!");
      queryClient.invalidateQueries("tours");
    },
    onError: (error) => {
      const { message } = error.response.data;
      if (message) {
        if (message.includes("E11000")) {
          setErrorToast("Dữ liệu đã tồn tại!");
        } else {
          setErrorToast(message);
        }
      }
    },
  });

  const mutationUpdate = useMutation({
    mutationFn: updateTour,
    onSuccess: (data) => {
      queryClient.invalidateQueries("tours");
      setTour(data);
      setSuccessToast("Cập nhật thành công!");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const mutationDelete = useMutation({
    mutationFn: deleteTour,
    onSuccess: () => {
      queryClient.invalidateQueries("tours");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const mutationDeleteMany = useMutation({
    mutationFn: deleteManyTour,
    onSuccess: () => {
      queryClient.invalidateQueries("tours");
      setSelectedAll(false);
      setListSelected([]);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  // Fetch data
  const { isPending, data } = useQuery({
    queryKey: ["tours", page, valueSearch],
    queryFn: () => fetchTours(page, valueSearch),
    placeholderData: keepPreviousData,
  });
  // ====================================================
  // Handle toast messages
  useEffect(() => {
    if (successToast) {
      setTimeout(() => {
        setSuccessToast("");
      }, [2000]);
    }
    if (errorToast) {
      setTimeout(() => {
        setErrorToast("");
      }, [2000]);
    }
  }, [errorToast, successToast]);

  // Validate on time
  useEffect(() => {
    // Validate name
    if (formDataToAdd.name !== undefined) {
      if (!formDataToAdd.name) {
        setNameError("Vui lòng nhập trường này!");
      } else {
        setNameError("");
      }
    } else {
      setNameError("");
    }
    // Validate price
    if (formDataToAdd.price !== undefined) {
      if (!formDataToAdd.price) {
        setPriceError("Vui lòng nhập trường này!");
      } else {
        setPriceError("");
      }
    } else {
      setPriceError("");
    }
    // Validate destinations
    if (formDataToAdd.destinations !== undefined) {
      if (formDataToAdd.destinations.length === 0) {
        setDestinationsError("Vui lòng chọn điểm đến!");
      } else {
        setDestinationsError("");
      }
    } else {
      setDestinationsError("");
    }
    // Validate startDestination
    if (formDataToAdd.startDestination !== undefined) {
      if (!formDataToAdd.startDestination) {
        setStartDestinationError("Vui lòng nhập trường này!");
      } else {
        setStartDestinationError("");
      }
    } else {
      setStartDestinationError("");
    }
    // Validate availableSeats
    if (formDataToAdd.availableSeats !== undefined) {
      if (!formDataToAdd.availableSeats) {
        setAvailableSeatsError("Vui lòng nhập trường này!");
      } else {
        setAvailableSeatsError("");
      }
    } else {
      setAvailableSeatsError("");
    }
    // Validate startDate
    if (formDataToAdd.startDate !== undefined) {
      if (!formDataToAdd.startDate) {
        setStartDateError("Vui lòng nhập trường này!");
      } else {
        setStartDateError("");
      }
    } else {
      setStartDateError("");
    }
    // Validate endDate
    if (formDataToAdd.endDate !== undefined) {
      if (!formDataToAdd.endDate) {
        setEndDateError("Vui lòng nhập trường này!");
      } else {
        setEndDateError("");
      }
    } else {
      setEndDateError("");
    }
    // Validate schedule
    if (formDataToAdd.schedule !== undefined) {
      if (!formDataToAdd.schedule) {
        setScheduleError("Vui lòng nhập trường này!");
      } else {
        setScheduleError("");
      }
    } else {
      setScheduleError("");
    }
    // Validate vehicle
    if (formDataToAdd.vehicle !== undefined) {
      if (!formDataToAdd.vehicle) {
        setVehicleError("Vui lòng nhập trường này!");
      } else {
        setVehicleError("");
      }
    } else {
      setVehicleError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formDataToAdd]);

  const onUpdate = async () => {
    mutationUpdate.mutate(formDataToUpdate);
  };

  const handleDelete = () => {
    mutationDelete.mutate(tour._id);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formDataToAdd.name) {
      setNameError("Vui lòng nhập trường này!");
      return;
    } else if (!formDataToAdd.price) {
      setPriceError("Vui lòng nhập trường này!");
      return;
    } else if (!formDataToAdd.destinations.length === 0) {
      setDestinationsError("Vui lòng chọn điểm đến!");
      return;
    } else if (!formDataToAdd.startDestination) {
      setStartDestinationError("Vui lòng nhập trường này!");
      return;
    } else if (!formDataToAdd.startDate) {
      setStartDateError("Vui lòng nhập trường này!");
      return;
    } else if (!formDataToAdd.endDate) {
      setEndDateError("Vui lòng nhập trường này!");
      return;
    } else if (!formDataToAdd.availableSeats) {
      setAvailableSeatsError("Vui lòng nhập trường này!");
      return;
    } else if (!formDataToAdd.schedule) {
      setScheduleError("Vui lòng nhập trường này!");
      return;
    } else if (!formDataToAdd.vehicle) {
      setVehicleError("Vui lòng nhập trường này!");
      return;
    }
    mutationAdd.mutate(formDataToAdd);
  };

  const handleDeleteMany = () => {
    mutationDeleteMany.mutate(listSelected);
  };

  const toggleSelectAll = () => {
    setSelectedAll(!selectedAll);
    if (!selectedAll) {
      setListSelected(data?.tours.map((item) => item._id));
    } else {
      setListSelected([]);
    }
  };

  const toggleSelectSingle = (id) => {
    setSelectedAll(false);
    if (listSelected.includes(id)) {
      setListSelected(listSelected.filter((item) => item !== id));
    } else {
      setListSelected([...listSelected, id]);
    }
  };

  const handleNextPage = () => {
    setSelectedAll(false);
    setListSelected([]);
    if (page === Math.ceil(data?.totalTours / 9) - 1) {
      return;
    }
    setPage(page + 1);
  };

  const handlePreviousPage = () => {
    setSelectedAll(false);
    setListSelected([]);
    if (page === 0) {
      return;
    }
    setPage(page - 1);
  };

  const handleShowDetailModal = (tour) => {
    setFormDataToUpdate({});
    setInputModifies({});
    setTour(tour);
    document.getElementById("modal-details-tour").showModal();
  };

  const handleShowModifyModal = (tour) => {
    setFormDataToUpdate({});
    setInputModifies({});
    setTour(tour);
    document.getElementById("modal-modify-tour").showModal();
  };

  const handleShowDeleteModal = (tour) => {
    setTour(tour);
    document.getElementById("modal-delete-tour").showModal();
  };

  const handleShowAddModal = () => {
    document.getElementById("modal-add-tour").showModal();
  };

  const handleShowDeleteManyModal = () => {
    document.getElementById("modal-deleteMany-tour").showModal();
  };

  const handleFormDataToUpdate = (e) => {
    setFormDataToUpdate({
      ...formDataToUpdate,
      [e.target.name]: e.target.value.trim(),
    });
  };

  const handleFormDataToAdd = (e) => {
    setFormDataToAdd({
      ...formDataToAdd,
      [e.target.name]: e.target.value.trim(),
    });
  };

  const handleDeleteUpdateImage = (item) => {
    const filteredImages = imageUpdateFiles.filter(
      (file) => file.name !== item.name
    );
    setImageUpdateFiles(filteredImages);
  };

  const handleChooseUpdateImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 1) {
      setErrorToast("Chọn tối đa 1 tệp hình ảnh!");
      return;
    }
    const newFiles = files.filter(
      (file) =>
        !imageUpdateFiles.some(
          (existingFile) => existingFile.name === file.name
        )
    );
    if (newFiles.length !== 0 && newFiles.length <= 5) {
      setImageUpdateFiles([...imageUpdateFiles, ...newFiles]);
    }
  };

  const uploadUpdateImages = async (e) => {
    e.preventDefault();
    if (imageUpdateFiles.length === 0) return;
    const storage = getStorage(app);
    setImageUpdateUrlFiles([]);
    setImageUpdateFileUploading(true);
    imageUpdateFiles.forEach((file) => {
      const storageRef = ref(
        storage,
        `tours/${"tour" + (tour.name + "-" || "") + file.name}`
      );
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUpdateFileUploadProgress(progress);
        },
        (error) => {
          setImageUpdateFiles([]);
          setImageUpdateFileUploadProgress(null);
          setImageUpdateFileUploading(false);
          console.error("Upload failed:", error);
        },
        () => {
          // Xử lý sau khi upload hoàn tất
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            if (downloadURL) {
              setImageUpdateUrlFiles((prevImageUrlFiles) => [
                ...prevImageUrlFiles,
                downloadURL,
              ]);
              setImageUpdateFileUploading(false);
              setImageUpdateFileUploadProgress(null);
              setImageUpdateUploadSuccess(true);
            }
          });
        }
      );
    });
  };

  const handleChooseImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 1) {
      setErrorToast("Chọn tối đa 1 tệp hình ảnh!");
      return;
    }
    const newFiles = files.filter(
      (file) =>
        !imageFiles.some((existingFile) => existingFile.name === file.name)
    );
    if (newFiles.length !== 0 && newFiles.length <= 5) {
      setImageFiles([...imageFiles, ...newFiles]);
    }
  };

  const uploadImages = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0) return;
    const storage = getStorage(app);
    setImageUrlFiles([]);
    setImageFileUploading(true);
    imageFiles.forEach((file) => {
      const storageRef = ref(
        storage,
        `destinations/${
          "destination_" + (formDataToAdd.name + "-" || "") + file.name
        }`
      );
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageFileUploadProgress(progress);
        },
        (error) => {
          setImageFiles([]);
          setImageFileUploadProgress(null);
          setImageFileUploading(false);
          console.error("Upload failed:", error);
        },
        () => {
          // Xử lý sau khi upload hoàn tất
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            if (downloadURL) {
              setImageUrlFiles((prevImageUrlFiles) => [
                ...prevImageUrlFiles,
                downloadURL,
              ]);
              setImageFileUploading(false);
              setImageFileUploadProgress(null);
              setImageUploadSuccess(true);
              setFormDataToAdd({ ...formDataToAdd, images: imageUrlFiles });
            }
          });
        }
      );
    });
  };

  const handleDeleteImage = (item) => {
    const filteredImages = imageFiles.filter((file) => file.name !== item.name);
    setImageFiles(filteredImages);
  };

  // Get destinations
  useEffect(() => {
    const getDestinations = async () => {
      try {
        const res = await axios.get("/api/destination/get?limit=1000");
        setDestinations(res.data.destinations);
      } catch (error) {
        console.log(error);
      }
    };
    getDestinations();
  }, []);

  // Get prices
  useEffect(() => {
    const getPrices = async () => {
      try {
        const res = await axios.get("/api/price/get?limit=1000");
        setPrices(res.data.prices);
      } catch (error) {
        console.log(error);
      }
    };
    getPrices();
  }, []);

  // Get schedules
  useEffect(() => {
    const getSchedules = async () => {
      try {
        const res = await axios.get("/api/schedule/get?limit=1000");
        setSchedules(res.data.schedules);
      } catch (error) {
        console.log(error);
      }
    };
    getSchedules();
  }, []);

  // Get tourType
  useEffect(() => {
    const getTourTypes = async () => {
      try {
        const res = await axios.get("/api/tourType/get?limit=1000");
        setTourTypes(res.data.tourTypes);
      } catch (error) {
        console.log(error);
      }
    };
    getTourTypes();
  }, []);

  const handleSelectChange = (event) => {
    const options = event.target.options;
    const values = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        values.push(options[i].value);
      }
    }
    setSelectedOptions(values);
  };

  const handleSelectChangeUpdate = (event) => {
    const options = event.target.options;
    const values = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        values.push(options[i].value);
      }
    }
    setSelectedOptionsUpdate(values);
  };

  useEffect(() => {
    if (tour?._id) {
      mutationUpdate.mutate({ destinations: selectedOptionsUpdate });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOptionsUpdate]);

  return (
    <div>
      <label className="input input-bordered flex items-center gap-2 md:hidden mb-4">
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          type="text"
          className="grow"
          placeholder="Tìm kiếm"
        />
        <FaSearch />
      </label>
      <div className="border p-4 rounded-md">
        <h1 className="text-xl font-bold pb-4 border-b-2 text-sky-600 flex justify-between items-center">
          Quản lý tour
          <label className="input input-bordered md:flex items-center gap-2 hidden">
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              type="text"
              className="grow"
              placeholder="Tìm kiếm"
            />
            <FaSearch />
          </label>
          <button onClick={handleShowAddModal} className="btn btn-info">
            Thêm
          </button>
        </h1>
        <div className="overflow-x-auto">
          {isPending ? (
            <div className="flex w-full flex-col gap-4 my-4">
              <div className="skeleton h-16 w-full"></div>
              <div className="skeleton h-16 w-full"></div>
              <div className="skeleton h-16 w-full"></div>
              <div className="skeleton h-16 w-full"></div>
              <div className="skeleton h-16 w-full"></div>
              <div className="skeleton h-16 w-full"></div>
            </div>
          ) : (
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th>
                    <label>
                      <input
                        checked={selectedAll}
                        onChange={toggleSelectAll}
                        type="checkbox"
                        className="checkbox"
                      />
                    </label>
                  </th>
                  <th>Tên tour</th>
                  <th>Mô tả</th>
                  <th>Nổi bật</th>
                  {listSelected.length !== 0 && (
                    <th className="flex justify-center items-center">
                      <button
                        onClick={handleShowDeleteManyModal}
                        className="btn btn-ghost btn-sm text-rose-500 border border-black"
                      >
                        Xóa {listSelected.length} đã chọn
                      </button>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {/* row */}
                {data.tours.length !== 0 ? (
                  data.tours.map((tour) => (
                    <tr key={tour._id}>
                      <th>
                        <label>
                          <input
                            checked={listSelected.includes(tour._id)}
                            onChange={() => toggleSelectSingle(tour._id)}
                            type="checkbox"
                            className="checkbox"
                          />
                        </label>
                      </th>
                      <td>
                        <p className="line-clamp-3">
                          {tour.name || (
                            <span className="italic text-sm">
                              Chưa cập nhật
                            </span>
                          )}
                        </p>
                      </td>
                      <td>
                        <p className="line-clamp-3">
                          {tour.description || (
                            <span className="italic text-sm">
                              Chưa cập nhật
                            </span>
                          )}
                        </p>
                      </td>
                      <td>
                        {tour.isOutstanding ? (
                          <span className="italic text-sm">Có</span>
                        ) : (
                          <span className="italic text-sm">Không</span>
                        )}
                      </td>
                      <th className="pr-0">
                        <div className="flex gap-2 flex-wrap items-center justify-end">
                          <button
                            onClick={() => handleShowDetailModal(tour)}
                            className="text-nowrap btn btn-ghost md:btn-xs border border-black"
                          >
                            Chi tiết
                          </button>
                          <button
                            onClick={() => handleShowModifyModal(tour)}
                            className="text-nowrap btn btn-ghost md:btn-xs border border-black"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleShowDeleteModal(tour)}
                            className="text-nowrap btn btn-ghost md:btn-xs text-rose-500 border border-red-500"
                          >
                            Xóa
                          </button>
                        </div>
                      </th>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center text-slate-400 text-xl p-10"
                    >
                      Dữ liệu rỗng
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
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
        {/* Modal details */}
        <dialog id="modal-details-tour" className="modal">
          <div className="modal-box">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg">Thông tin dữ liệu</h3>
            <div className="my-4">
              <div className="flex flex-col items-center">
                {/* More info */}
                <div className="text-xl">
                  <h3>
                    <strong>Tên tour: </strong>
                    {tour?.name || "Chưa cập nhật"}
                  </h3>
                  <div>
                    <strong>Hình ảnh: </strong>
                    <div className="flex gap-4 flex-wrap">
                      {tour?.images.map((item) => (
                        <div key={item} className="avatar">
                          <div className="w-32 rounded">
                            <img key={item} src={item} alt={item} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <h3>
                    <strong>Mô tả: </strong>
                    {tour?.description || "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Giá: </strong>
                    {`Người lớn: ${tour?.price.priceForAdult} | Trẻ em: ${tour?.price.priceForChildren} | Em bé: ${tour?.price.priceForBaby}`}
                  </h3>
                  <h3>
                    <strong>Thể loại: </strong>
                    {tour?.tourType?.name || "Không có"}
                  </h3>
                  <h3>
                    <strong>Nổi bật: </strong>
                    {tour?.isOutstanding ? "Có" : "Không"}
                  </h3>
                  <h3>
                    <strong>Điểm đến: </strong>
                    <ul>
                      {tour?.destinations.map((item) => (
                        <li
                          className="p-1 mb-1 bg-slate-200"
                          key={item?._id + "detail"}
                        >
                          {item.name}
                        </li>
                      )) || "Chưa cập nhật"}
                    </ul>
                  </h3>
                  <h3>
                    <strong>Điểm bắt đầu: </strong>
                    {tour?.startDestination?.name || "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Lịch trình: </strong>
                    {tour?.schedule?.name || "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Phương tiện: </strong>
                    {tour?.vehicle || "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Ngày bắt đầu: </strong>
                    {moment(tour?.startDate).format("DD/MM/yyyy") ||
                      "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Ngày kết thúc: </strong>
                    {moment(tour?.endDate).format("DD/MM/yyyy") ||
                      "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Số chỗ trống: </strong>
                    {tour?.availableSeats || "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Ngày tạo: </strong>
                    {moment(tour?.createdAt).format("DD/MM/YYYY HH:mm:ss") ||
                      "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Chỉnh sửa lúc: </strong>
                    {moment(tour?.updatedAt).format("DD/MM/YYYY HH:mm:ss") ||
                      "Chưa cập nhật"}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </dialog>
        {/* Modal modify */}
        <dialog id="modal-modify-tour" className="modal">
          <div className="modal-box">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg">Cập nhật thông tin</h3>
            {successToast && (
              <div className="alert alert-success text-white my-2 animate-pulse">
                <FaCheckCircle className="text-xl" />
                <span className="text-xl">{successToast}</span>
              </div>
            )}
            {errorToast && (
              <div className="alert alert-error text-white my-2 animate-pulse">
                <MdError className="text-xl" />
                <span className="text-xl">{errorToast}</span>
              </div>
            )}
            <div className="my-4">
              <div className="">
                {/* Name */}
                <div>
                  <div className="flex text-xl py-4 border-b">
                    <h2 className="font-semibold flex-1">Tiêu đề</h2>
                    <p className="flex-1 line-clamp-3">{tour?.name || ""}</p>
                    <FaPen
                      onClick={() =>
                        setInputModifies({
                          name: !inputModifies.name,
                        })
                      }
                      className="text-sky-600 cursor-pointer ml-2"
                    />
                  </div>
                  <div className={`p-2 ${!inputModifies.name && "hidden"}`}>
                    <input
                      onChange={handleFormDataToUpdate}
                      name="name"
                      placeholder="Nhập dữ liệu..."
                      type="text"
                      className="input input-bordered w-full"
                    />
                    <div className="flex gap-2 justify-end my-2">
                      <button
                        onClick={() => setInputModifies({})}
                        className="btn"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => {
                          onUpdate();
                          setInputModifies({});
                        }}
                        className="btn btn-info"
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                </div>
                {/* Destination images input update */}
                <div className="flex items-end gap-2">
                  <label className="form-control w-full mt-4">
                    <div className="label p-0 py-2">
                      <span className="label-text font-bold ">Hình ảnh</span>
                    </div>
                    <input
                      multiple
                      accept="image/*"
                      onChange={handleChooseUpdateImages}
                      type="file"
                      className="file-input file-input-bordered w-full max-w-xs"
                    />
                  </label>
                  <button onClick={uploadUpdateImages} className="btn btn-info">
                    Tải lên
                  </button>
                  <button
                    disabled={imageUpdateFileUploading}
                    onClick={() =>
                      mutationUpdate.mutate({ images: imageUpdateUrlFiles })
                    }
                    className={`btn btn-info ${
                      imageUpdateFileUploading
                        ? "bg-slate-300"
                        : "hover:bg-sky-600"
                    }`}
                  >
                    Cập nhật hình ảnh
                  </button>
                </div>
                {imageUpdateUploadSuccess && <p>Tải lên thành công!</p>}
                {imageUpdateFileUploadProgress !== null && (
                  <div>
                    <progress
                      className="progress progress-primary w-56"
                      value={imageUpdateFileUploadProgress}
                      max="100"
                    ></progress>
                  </div>
                )}
                <div className="flex mt-4 gap-4">
                  {imageUpdateFiles.length !== 0 &&
                    imageUpdateFiles.map((item) => (
                      <div key={item.name} className="avatar">
                        <div className="w-16 rounded cursor-pointer relative">
                          <MdClose
                            onClick={() => handleDeleteUpdateImage(item)}
                            className="absolute right-0 text-xl text-white hover:text-rose-500"
                          />
                          <img
                            src={URL.createObjectURL(item)}
                            alt={item.name}
                          />
                        </div>
                      </div>
                    ))}
                </div>
                {/* Start Date */}
                <div>
                  <div className="flex text-xl py-4 border-b">
                    <h2 className="font-semibold flex-1">Ngày bắt đầu</h2>
                    <p className="flex-1">{tour?.startDate || ""}</p>
                    <FaPen
                      onClick={() =>
                        setInputModifies({
                          startDate: !inputModifies.startDate,
                        })
                      }
                      className="text-sky-600 cursor-pointer ml-2"
                    />
                  </div>
                  <div
                    className={`p-2 ${!inputModifies.startDate && "hidden"}`}
                  >
                    <input
                      onChange={handleFormDataToUpdate}
                      name="startDate"
                      placeholder="Nhập dữ liệu..."
                      type="date"
                      className="input input-bordered w-full"
                    />
                    <div className="flex gap-2 justify-end my-2">
                      <button
                        onClick={() => setInputModifies({})}
                        className="btn"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => {
                          onUpdate();
                          setInputModifies({});
                        }}
                        className="btn btn-info"
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                </div>
                {/* End date */}
                <div>
                  <div className="flex text-xl py-4 border-b">
                    <h2 className="font-semibold flex-1">Ngày kết thúc</h2>
                    <p className="flex-1">{tour?.endDate || ""}</p>
                    <FaPen
                      onClick={() =>
                        setInputModifies({
                          endDate: !inputModifies.endDate,
                        })
                      }
                      className="text-sky-600 cursor-pointer ml-2"
                    />
                  </div>
                  <div className={`p-2 ${!inputModifies.endDate && "hidden"}`}>
                    <input
                      onChange={handleFormDataToUpdate}
                      name="endDate"
                      placeholder="Nhập dữ liệu..."
                      type="date"
                      className="input input-bordered w-full"
                    />
                    <div className="flex gap-2 justify-end my-2">
                      <button
                        onClick={() => setInputModifies({})}
                        className="btn"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => {
                          onUpdate();
                          setInputModifies({});
                        }}
                        className="btn btn-info"
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                </div>
                {/* Description */}
                <div>
                  <div className="flex text-xl py-4 border-b">
                    <h2 className="font-semibold flex-1">Mô tả</h2>
                    <p className="flex-1 line-clamp-3">
                      {tour?.description || ""}
                    </p>
                    <FaPen
                      onClick={() =>
                        setInputModifies({
                          description: !inputModifies.description,
                        })
                      }
                      className="text-sky-600 cursor-pointer ml-2"
                    />
                  </div>
                  <div
                    className={`p-2 ${!inputModifies.description && "hidden"}`}
                  >
                    <input
                      onChange={handleFormDataToUpdate}
                      name="description"
                      placeholder="Nhập dữ liệu..."
                      type="text"
                      className="input input-bordered w-full"
                    />
                    <div className="flex gap-2 justify-end my-2">
                      <button
                        onClick={() => setInputModifies({})}
                        className="btn"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => {
                          onUpdate();
                          setInputModifies({});
                        }}
                        className="btn btn-info"
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                </div>
                {/* Price choosing update */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Chọn giá <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <select
                    onChange={(e) => {
                      mutationUpdate.mutate({ price: e.target.value });
                    }}
                    defaultValue={"Chọn giá"}
                    className="select select-bordered w-full max-w-xs"
                  >
                    <option disabled>Chọn giá</option>
                    {prices.length !== 0 &&
                      prices.map((item) => (
                        <option key={item._id} value={item._id}>
                          {`Người lớn: ${item.priceForAdult} | Trẻ em: ${item.priceForChildren} | Em bé: ${item.priceForBaby}`}
                        </option>
                      ))}
                  </select>
                </label>
                {/* TourType choosing update */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Chọn thể loại <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <select
                    onChange={(e) => {
                      mutationUpdate.mutate({ tourType: e.target.value });
                    }}
                    defaultValue={"Chọn thể loại"}
                    className="select select-bordered w-full max-w-xs"
                  >
                    <option disabled>Chọn thể loại</option>
                    {tourTypes.length !== 0 &&
                      tourTypes.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </label>
                {/* Destinations choosing update */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Chọn điểm đến <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <select
                    multiple
                    onChange={handleSelectChangeUpdate}
                    defaultValue={["Chọn điểm đến"]}
                    className="select select-bordered w-full max-w-xs"
                  >
                    <option disabled>Chọn điểm đến</option>
                    {destinations.length !== 0 &&
                      destinations.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </label>
                {/* Start destinations choosing update */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Chọn điểm bắt đầu <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <select
                    onChange={(e) => {
                      mutationUpdate.mutate({
                        startDestination: e.target.value,
                      });
                    }}
                    defaultValue={"Chọn điểm bắt đầu"}
                    className="select select-bordered w-full max-w-xs"
                  >
                    <option disabled>Chọn điểm bắt đầu</option>
                    {destinations.length !== 0 &&
                      destinations.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </label>
                {/* Schedule choosing update */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Chọn lịch trình <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <select
                    onChange={(e) => {
                      mutationUpdate.mutate({ schedule: e.target.value });
                    }}
                    defaultValue={"Chọn lịch trình"}
                    className="select select-bordered w-full max-w-xs"
                  >
                    <option disabled>Chọn lịch trình</option>
                    {schedules.length !== 0 &&
                      schedules.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </label>
                {/* Available seats */}
                <div>
                  <div className="flex text-xl py-4 border-b">
                    <h2 className="font-semibold flex-1">Số chỗ trống</h2>
                    <p className="flex-1">{tour?.availableSeats || ""}</p>
                    <FaPen
                      onClick={() =>
                        setInputModifies({
                          availableSeats: !inputModifies.availableSeats,
                        })
                      }
                      className="text-sky-600 cursor-pointer ml-2"
                    />
                  </div>
                  <div
                    className={`p-2 ${
                      !inputModifies.availableSeats && "hidden"
                    }`}
                  >
                    <input
                      onChange={handleFormDataToUpdate}
                      name="availableSeats"
                      placeholder="Nhập dữ liệu..."
                      type="number"
                      className="input input-bordered w-full"
                    />
                    <div className="flex gap-2 justify-end my-2">
                      <button
                        onClick={() => setInputModifies({})}
                        className="btn"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => {
                          onUpdate();
                          setInputModifies({});
                        }}
                        className="btn btn-info"
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                </div>
                {/* Is outstanding */}
                <div>
                  <div className="flex text-xl py-4 border-b">
                    <h2 className="font-semibold flex-1">Nổi bật</h2>
                    <input
                      className="checkbox"
                      onChange={(e) =>
                        mutationUpdate.mutate({
                          ...formDataToUpdate,
                          isOutstanding: e.target.checked,
                        })
                      }
                      defaultChecked={tour?.isOutstanding}
                      type="checkbox"
                    />
                  </div>
                </div>
                {/* Vehicle */}
                <div>
                  <div className="flex text-xl py-4 border-b">
                    <h2 className="font-semibold flex-1">Phương tiện</h2>
                    <p className="flex-1">{tour?.vehicle || ""}</p>
                    <FaPen
                      onClick={() =>
                        setInputModifies({
                          vehicle: !inputModifies.vehicle,
                        })
                      }
                      className="text-sky-600 cursor-pointer ml-2"
                    />
                  </div>
                  <div className={`p-2 ${!inputModifies.vehicle && "hidden"}`}>
                    <input
                      onChange={handleFormDataToUpdate}
                      name="vehicle"
                      placeholder="Nhập dữ liệu..."
                      type="checkbox"
                      className="input input-bordered w-full"
                    />
                    <div className="flex gap-2 justify-end my-2">
                      <button
                        onClick={() => setInputModifies({})}
                        className="btn"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => {
                          onUpdate();
                          setInputModifies({});
                        }}
                        className="btn btn-info"
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </dialog>
        {/* Modal delete */}
        <dialog id="modal-delete-tour" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Xóa dữ liệu</h3>
            <div className="flex flex-col items-center gap-4 my-4">
              <FaQuestionCircle className="text-4xl text-slate-500" />
              <p className="text-xl text-slate-500">
                Bạn có chắc muốn xóa mục này?
              </p>
            </div>
            <div className="modal-action">
              <form method="dialog">
                <div className="flex gap-8">
                  <button className="btn">Hủy</button>
                  <button onClick={handleDelete} className="btn btn-error">
                    Xóa
                  </button>
                </div>
              </form>
            </div>
          </div>
        </dialog>
        {/* Modal add */}
        <dialog id="modal-add-tour" className="modal">
          <div className="modal-box">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg">Thêm dữ liệu</h3>
            {successToast && (
              <div className="alert alert-success text-white my-2 animate-pulse">
                <FaCheckCircle className="text-xl" />
                <span className="text-xl">{successToast}</span>
              </div>
            )}
            {errorToast && (
              <div className="alert alert-error text-white my-2 animate-pulse">
                <MdError className="text-xl" />
                <span className="text-xl">{errorToast}</span>
              </div>
            )}
            <form onSubmit={handleAdd} className="my-4">
              <div>
                {/* Name */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Tên tour <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <MdTour className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
                      name="name"
                      type="text"
                      className="grow"
                      placeholder="Nhập dữ liệu..."
                    />
                  </label>
                  {nameError && (
                    <span className="text-rose-500 italic mt-1">
                      {nameError}
                    </span>
                  )}
                </label>
                {/* Destination images input */}
                <div className="flex items-end gap-2">
                  <label className="form-control w-full mt-4">
                    <div className="label p-0 py-2">
                      <span className="label-text font-bold ">Hình ảnh</span>
                    </div>
                    <input
                      multiple
                      accept="image/*"
                      onChange={handleChooseImages}
                      type="file"
                      className="file-input file-input-bordered w-full max-w-xs"
                    />
                  </label>
                  <button onClick={uploadImages} className="btn btn-info">
                    Tải lên
                  </button>
                </div>
                {imageUploadSuccess && <p>Tải lên thành công!</p>}
                {imageFileUploadProgress !== null && (
                  <div>
                    <progress
                      className="progress progress-primary w-56"
                      value={imageFileUploadProgress}
                      max="100"
                    ></progress>
                  </div>
                )}
                <div className="flex mt-4 gap-4">
                  {imageFiles.length !== 0 &&
                    imageFiles.map((item) => (
                      <div key={item.name} className="avatar">
                        <div className="w-16 rounded cursor-pointer relative">
                          <MdClose
                            onClick={() => handleDeleteImage(item)}
                            className="absolute right-0 text-xl text-white hover:text-rose-500"
                          />
                          <img
                            src={URL.createObjectURL(item)}
                            alt={item.name}
                          />
                        </div>
                      </div>
                    ))}
                </div>
                {/* Price choosing */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Chọn giá <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <select
                    onChange={(e) => {
                      setFormDataToAdd({
                        ...formDataToAdd,
                        price: e.target.value,
                      });
                    }}
                    defaultValue={"Chọn giá"}
                    className="select select-bordered w-full max-w-xs"
                  >
                    <option disabled>Chọn giá</option>
                    {prices.length !== 0 &&
                      prices.map((item) => (
                        <option key={item._id} value={item._id}>
                          {`Người lớn: ${item.priceForAdult} | Trẻ em: ${item.priceForChildren} | Em bé: ${item.priceForBaby}`}
                        </option>
                      ))}
                  </select>
                  {priceError && (
                    <span className="text-rose-500 italic mt-1">
                      {priceError}
                    </span>
                  )}
                </label>
                {/* TourType choosing */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Chọn thể loại tour{" "}
                      <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <select
                    onChange={(e) => {
                      setFormDataToAdd({
                        ...formDataToAdd,
                        tourType: e.target.value,
                      });
                    }}
                    defaultValue={"Chọn thể loại"}
                    className="select select-bordered w-full max-w-xs"
                  >
                    <option disabled>Chọn thể loại</option>
                    {tourTypes.length !== 0 &&
                      tourTypes.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                  {priceError && (
                    <span className="text-rose-500 italic mt-1">
                      {priceError}
                    </span>
                  )}
                </label>
                {/* Destinations choosing */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Chọn điểm đến <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <select
                    multiple
                    onChange={handleSelectChange}
                    defaultValue={["Chọn điểm đến"]}
                    className="select select-bordered w-full max-w-xs"
                  >
                    <option disabled>Chọn điểm đến</option>
                    {destinations.length !== 0 &&
                      destinations.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                  {destinationsError && (
                    <span className="text-rose-500 italic mt-1">
                      {destinationsError}
                    </span>
                  )}
                </label>
                {/* Display destination choosed */}
                <div></div>
                {/* Start destination choosing */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Chọn điểm bắt đầu <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <select
                    onChange={(e) => {
                      setFormDataToAdd({
                        ...formDataToAdd,
                        startDestination: e.target.value,
                      });
                    }}
                    defaultValue={"Chọn điểm bắt đầu"}
                    className="select select-bordered w-full max-w-xs"
                  >
                    <option disabled>Chọn điểm bắt đầu</option>
                    {destinations.length !== 0 &&
                      destinations.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                  {startDestinationError && (
                    <span className="text-rose-500 italic mt-1">
                      {startDestinationError}
                    </span>
                  )}
                </label>
                {/* Start date */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Ngày bắt đầu <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <MdDateRange className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
                      name="startDate"
                      type="date"
                      className="grow"
                      placeholder="Nhập dữ liệu..."
                    />
                  </label>
                  {startDateError && (
                    <span className="text-rose-500 italic mt-1">
                      {startDateError}
                    </span>
                  )}
                </label>
                {/* Description */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">Mô tả</span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <MdDescription className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
                      name="description"
                      type="text"
                      className="grow"
                      placeholder="Nhập dữ liệu..."
                    />
                  </label>
                </label>
                {/* End date */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Ngày kết thúc <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <MdDateRange className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
                      name="endDate"
                      type="date"
                      className="grow"
                      placeholder="Nhập dữ liệu..."
                    />
                  </label>
                  {endDateError && (
                    <span className="text-rose-500 italic mt-1">
                      {endDateError}
                    </span>
                  )}
                </label>
                {/* Available seats */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Số chỗ trống <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <MdChairAlt className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
                      name="availableSeats"
                      type="number"
                      className="grow"
                      placeholder="Nhập dữ liệu..."
                    />
                  </label>
                  {availableSeatsError && (
                    <span className="text-rose-500 italic mt-1">
                      {availableSeatsError}
                    </span>
                  )}
                </label>
                {/* Schedule */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Chọn lịch trình <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <select
                    onChange={(e) => {
                      setFormDataToAdd({
                        ...formDataToAdd,
                        schedule: e.target.value,
                      });
                    }}
                    defaultValue={"Chọn lịch trình"}
                    className="select select-bordered w-full max-w-xs"
                  >
                    <option disabled>Chọn lịch trình</option>
                    {schedules.length !== 0 &&
                      schedules.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                  {scheduleError && (
                    <span className="text-rose-500 italic mt-1">
                      {scheduleError}
                    </span>
                  )}
                </label>
                {/* Vehicle */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Phương tiện <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <MdChairAlt className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
                      name="vehicle"
                      type="text"
                      className="grow"
                      placeholder="Nhập dữ liệu..."
                    />
                  </label>
                  {vehicleError && (
                    <span className="text-rose-500 italic mt-1">
                      {vehicleError}
                    </span>
                  )}
                </label>
              </div>
              <div className="flex justify-center w-full mt-10">
                <div className="w-full md:w-1/2">
                  <button
                    type="submit"
                    disabled={imageFileUploading}
                    className={`flex justify-center items-center w-full text-xl font-bold uppercase text-white bg-rose-600 p-4 rounded-3xl
                            ${isPending ? "bg-slate-300" : "hover:bg-sky-600"}`}
                  >
                    <span>Thêm</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </dialog>
        {/* Modal delete many */}
        <dialog id="modal-deleteMany-tour" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Xóa dữ liệu</h3>
            <div className="flex flex-col items-center gap-4 my-4">
              <FaQuestionCircle className="text-4xl text-slate-500" />
              <p className="text-xl text-slate-500">
                Bạn có chắc muốn xóa các mục này?
              </p>
            </div>
            <div className="modal-action">
              <form method="dialog">
                <div className="flex gap-8">
                  <button className="btn">Hủy</button>
                  <button onClick={handleDeleteMany} className="btn btn-error">
                    Xóa đã chọn
                  </button>
                </div>
              </form>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  );
};

export default DashTour;
