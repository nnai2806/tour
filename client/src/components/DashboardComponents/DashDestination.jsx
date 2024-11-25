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
  MdClose,
  MdDescription,
  MdError,
  MdOutlineDriveFileRenameOutline,
} from "react-icons/md";
import { useDebounce } from "use-debounce";
import { app } from "../../firebase";
// import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DashDestination = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [listSelected, setListSelected] = useState([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [destination, setDestination] = useState(null);
  const [inputModifies, setInputModifies] = useState({});
  const [formDataToUpdate, setFormDataToUpdate] = useState({});
  const [formDataToAdd, setFormDataToAdd] = useState({});
  const [successToast, setSuccessToast] = useState("");
  const [errorToast, setErrorToast] = useState("");
  const [searchText, setSearchText] = useState("");
  const [valueSearch] = useDebounce(searchText, 500);
  const [provinces, setProvinces] = useState([]);
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

  const handleChooseImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 6) {
      setErrorToast("Chọn tối đa 6 tệp hình ảnh!");
    }
    const newFiles = files.filter(
      (file) =>
        !imageFiles.some((existingFile) => existingFile.name === file.name)
    );
    if (newFiles.length !== 0 && newFiles.length <= 5) {
      setImageFiles([...imageFiles, ...newFiles]);
    }
  };

  const handleChooseUpdateImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 6) {
      setErrorToast("Chọn tối đa 6 tệp hình ảnh!");
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
        `destinations/${
          "destination_" + (destination.name + "-" || "") + file.name
        }`
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

  const handleDeleteUpdateImage = (item) => {
    const filteredImages = imageUpdateFiles.filter(
      (file) => file.name !== item.name
    );
    setImageUpdateFiles(filteredImages);
  };

  // Get provinces
  useEffect(() => {
    const getProvinces = async () => {
      try {
        const res = await axios.get("/api/province/get?limit=1000");
        setProvinces(res.data.provinces);
      } catch (error) {
        console.log(error);
      }
    };
    getProvinces();
  }, []);

  useEffect(() => {
    setFormDataToAdd({ ...formDataToAdd, images: imageUrlFiles });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrlFiles]);

  // States manage input's errors
  const [nameError, setNameError] = useState("");
  const [provinceError, setProvinceError] = useState("");

  // ==============================================
  // Method call API
  const fetchDestinations = async (page = 0, valueSearch) => {
    const res = await axios.get(
      `/api/destination/get?page=${page}&search=${valueSearch}`
    );
    return res.data;
  };

  const addDestination = async (formDataToUpdate) => {
    const res = await axios.post("/api/destination/create", formDataToUpdate);
    return res.data;
  };

  const updateDestination = async (formDataToUpdate) => {
    const res = await axios.put(
      `/api/destination/update/${destination._id}`,
      formDataToUpdate
    );
    return res.data;
  };

  const deleteDestination = async (id) => {
    await axios.delete(`/api/destination/delete/${id}`);
  };

  const deleteManyDestination = async (listId) => {
    await axios.delete("/api/destination/delete", {
      data: { destinationIds: listId },
    });
  };
  // ==============================================
  // Hanlde mutation
  const mutationAdd = useMutation({
    mutationFn: addDestination,
    onSuccess: () => {
      setSuccessToast("Thêm thành công!");
      queryClient.invalidateQueries("destinations");
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
    mutationFn: updateDestination,
    onSuccess: (data) => {
      queryClient.invalidateQueries("destinations");
      setDestination(data);
      setSuccessToast("Cập nhật thành công!");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const mutationDelete = useMutation({
    mutationFn: deleteDestination,
    onSuccess: () => {
      queryClient.invalidateQueries("destinations");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const mutationDeleteMany = useMutation({
    mutationFn: deleteManyDestination,
    onSuccess: () => {
      queryClient.invalidateQueries("destinations");
      setSelectedAll(false);
      setListSelected([]);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  // Fetch data
  const { isPending, data } = useQuery({
    queryKey: ["destinations", page, valueSearch],
    queryFn: () => fetchDestinations(page, valueSearch),
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

  // Validate formDataToAdd
  useEffect(() => {
    if (formDataToAdd.name !== undefined) {
      if (!formDataToAdd.name) {
        setNameError("Vui lòng nhập tên điểm đến!");
      } else {
        setNameError("");
      }
    } else {
      setNameError("");
    }

    if (formDataToAdd.province !== undefined) {
      if (!formDataToAdd.province) {
        setProvinceError("Vui lòng chọn tỉnh, thành phố!");
      } else {
        setProvinceError("");
      }
    } else {
      setProvinceError("");
    }
  }, [formDataToAdd]);

  const onUpdate = async () => {
    mutationUpdate.mutate(formDataToUpdate);
  };

  const handleDelete = () => {
    mutationDelete.mutate(destination._id);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formDataToAdd.name) {
      setNameError("Vui lòng nhập tên điểm đến!");
      return;
    } else if (!formDataToAdd.province) {
      setProvinceError("Vui lòng chọn tỉnh, thành phố!");
      return;
    }
    mutationAdd.mutate(formDataToAdd);
    e.target.reset();
    setImageFiles([]);
    setImageUploadSuccess(null);
  };

  const handleDeleteMany = () => {
    mutationDeleteMany.mutate(listSelected);
  };

  const toggleSelectAll = () => {
    setSelectedAll(!selectedAll);
    if (!selectedAll) {
      setListSelected(data?.destinations.map((item) => item._id));
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
    if (page === Math.ceil(data?.totalDestinations / 9) - 1) {
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

  const handleShowDetailModal = (destination) => {
    setFormDataToUpdate({});
    setInputModifies({});
    setDestination(destination);
    document.getElementById("modal-details-destination").showModal();
  };

  const handleShowModifyModal = (destination) => {
    setImageUpdateUploadSuccess(null);
    setImageUpdateFiles([]);
    setFormDataToUpdate({});
    setInputModifies({});
    setDestination(destination);
    document.getElementById("modal-modify-destination").showModal();
  };

  const handleShowDeleteModal = (destination) => {
    setDestination(destination);
    document.getElementById("modal-delete-destination").showModal();
  };

  const handleShowAddModal = () => {
    document.getElementById("modal-add-destination").showModal();
  };

  const handleShowDeleteManyModal = () => {
    document.getElementById("modal-deleteMany-user").showModal();
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
          Quản lý điểm đến
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
                  <th>Tên địa điểm</th>
                  <th>Mô tả</th>
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
                {/* row 1 */}
                {data.destinations.length !== 0 ? (
                  data.destinations.map((destination) => (
                    <tr key={destination._id}>
                      <th>
                        <label>
                          <input
                            checked={listSelected.includes(destination._id)}
                            onChange={() => toggleSelectSingle(destination._id)}
                            type="checkbox"
                            className="checkbox"
                          />
                        </label>
                      </th>
                      <td>{destination.name}</td>
                      <td>
                        <p className="line-clamp-3">
                          {destination.description || (
                            <span className="italic text-sm">
                              Chưa cập nhật
                            </span>
                          )}
                        </p>
                      </td>
                      <th className="pr-0">
                        <div className="flex gap-2 flex-wrap items-center justify-end">
                          <button
                            onClick={() => handleShowDetailModal(destination)}
                            className="text-nowrap btn btn-ghost md:btn-xs border border-black"
                          >
                            Chi tiết
                          </button>
                          <button
                            onClick={() => handleShowModifyModal(destination)}
                            className="text-nowrap btn btn-ghost md:btn-xs border border-black"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleShowDeleteModal(destination)}
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
        {/* Modal details */}
        <dialog id="modal-details-destination" className="modal">
          <div className="modal-box">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg">Thông tin điểm đến</h3>
            <div className="my-4">
              <div className="flex flex-col items-center">
                {/* Name */}
                <h1 className="text-xl font-bold my-2 text-sky-600">
                  {destination?.name}
                </h1>
                <h3 className="italic mb-2">
                  <strong>Mô tả: </strong>
                  {destination?.description}
                </h3>
                <h3 className="italic mb-2">
                  <strong>Tỉnh, thành phố: </strong>
                  {destination?.province?.name}
                </h3>
                <div>
                  <strong>Hình ảnh: </strong>
                  <div className="flex gap-4 flex-wrap">
                    {destination?.images.map((item) => (
                      <div key={item} className="avatar">
                        <div className="w-32 rounded">
                          <img key={item} src={item} alt={item} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <h3>
                  <strong>Ngày tạo: </strong>
                  {moment(destination?.createdAt).format(
                    "DD/MM/YYYY HH:mm:ss"
                  ) || "Chưa cập nhật"}
                </h3>
                <h3>
                  <strong>Chỉnh sửa lúc: </strong>
                  {moment(destination?.updatedAt).format(
                    "DD/MM/YYYY HH:mm:ss"
                  ) || "Chưa cập nhật"}
                </h3>
              </div>
            </div>
          </div>
        </dialog>
        {/* Modal modify */}
        <dialog id="modal-modify-destination" className="modal">
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
                    <h2 className="font-semibold flex-1">Tên điểm đến</h2>
                    <p className="flex-1">{destination?.name || ""}</p>
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
                      placeholder="Nhập tên điểm đến"
                      type="text"
                      className="input input-bordered w-full"
                    />
                    <div className="flex gap-2 justify-end my-2">
                      <button
                        onClick={() =>
                          setInputModifies({ ...inputModifies, name: false })
                        }
                        className="btn"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => {
                          onUpdate();
                          setInputModifies({ ...inputModifies, name: false });
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
                  <div className="flex items-center justify-between text-xl py-4 border-b">
                    <h2 className="font-semibold flex-1">Mô tả</h2>
                    <p className="flex-1 line-clamp-3">
                      {destination?.description || ""}
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
                      placeholder="Nhập mô tả"
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
                {/* Province choosing update */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Chọn tỉnh, thành phố{" "}
                      <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <select
                    onChange={(e) => {
                      mutationUpdate.mutate({ province: e.target.value });
                    }}
                    defaultValue={"Chọn tỉnh, thành phố"}
                    className="select select-bordered w-full max-w-xs"
                  >
                    <option disabled>Chọn tỉnh, thành phố</option>
                    {provinces.length !== 0 &&
                      provinces.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </label>
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
                      imageFileUploading ? "bg-slate-300" : "hover:bg-sky-600"
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
              </div>
            </div>
          </div>
        </dialog>
        {/* Modal delete */}
        <dialog id="modal-delete-destination" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Xóa người dùng</h3>
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
        <dialog id="modal-add-destination" className="modal">
          <div className="modal-box">
            <form id="form-add-modal" method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg">Thêm điểm đến</h3>
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
                {/* Destination name input */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Tên điểm đến <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <MdOutlineDriveFileRenameOutline className=" text-slate-500" />
                    <input
                      onChange={handleFormDataToAdd}
                      name="name"
                      type="text"
                      className="grow"
                      placeholder="Nhập tên điểm đến..."
                    />
                  </label>
                  {nameError && (
                    <span className="text-rose-500 italic mt-1">
                      {nameError}
                    </span>
                  )}
                </label>
                {/* Destination description input */}
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
                      placeholder="Nhập mô tả..."
                    />
                  </label>
                </label>
                {/* Province choosing */}
                <label className="form-control w-full mt-4">
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Chọn tỉnh, thành phố{" "}
                      <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <select
                    onChange={(e) => {
                      setFormDataToAdd({
                        ...formDataToAdd,
                        province: e.target.value,
                      });
                    }}
                    defaultValue={"Chọn tỉnh, thành phố"}
                    className="select select-bordered w-full max-w-xs"
                  >
                    <option disabled>Chọn tỉnh, thành phố</option>
                    {provinces.length !== 0 &&
                      provinces.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                  {provinceError && (
                    <span className="text-rose-500 italic mt-1">
                      {provinceError}
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
              </div>
              <div className="flex justify-center w-full mt-10">
                <div className="w-full md:w-1/2">
                  <button
                    type="submit"
                    disabled={imageFileUploading}
                    className={`flex justify-center items-center w-full text-xl font-bold uppercase text-white bg-rose-600 p-4 rounded-3xl
                    ${
                      imageFileUploading ? "bg-slate-300" : "hover:bg-sky-600"
                    }`}
                  >
                    <span>Thêm</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </dialog>
        {/* Modal delete many */}
        <dialog id="modal-deleteMany-user" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Xóa người dùng</h3>
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

export default DashDestination;
