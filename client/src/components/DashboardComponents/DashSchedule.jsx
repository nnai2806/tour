import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaPen,
  FaPlusCircle,
  FaQuestionCircle,
  FaSearch,
} from "react-icons/fa";
import { MdError, MdSchedule } from "react-icons/md";
import { useDebounce } from "use-debounce";

const DashSchedule = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [listSelected, setListSelected] = useState([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [scheduleDetail, setScheduleDetail] = useState(null);
  const [scheduleDetails, setScheduleDetails] = useState([]);
  const [scheduleDetailsId, setScheduleDetailsId] = useState([]);
  const [inputModifies, setInputModifies] = useState({});
  const [formDataToUpdate, setFormDataToUpdate] = useState({});
  const [formDataToAdd, setFormDataToAdd] = useState({});
  const [formDataToAddDetail, setFormDataToAddDetail] = useState({});
  const [successToast, setSuccessToast] = useState("");
  const [errorToast, setErrorToast] = useState("");
  const [searchText, setSearchText] = useState("");
  const [valueSearch] = useDebounce(searchText, 500);

  // States manage input's errors
  const [nameError, setNameError] = useState("");
  const [contentError, setContentError] = useState("");
  const [nameDetailError, setNameDetailError] = useState("");

  // ==============================================
  // Method call API for schedule details
  const addScheduleDetails = async (formData) => {
    const res = await axios.post("/api/scheduleDetail/create", formData);
    return res.data;
  };

  const deleteScheduleDetails = async (id) => {
    await axios.delete(`/api/scheduleDetail/delete/${id}`);
  };
  // ==============================================
  // Method call API for schedule
  const fetchSchedules = async (page = 0, valueSearch) => {
    const res = await axios.get(
      `/api/schedule/get?page=${page}&search=${valueSearch}`
    );
    return res.data;
  };

  const addSchedule = async (formData) => {
    const res = await axios.post("/api/schedule/create", formData);
    return res.data;
  };

  const updateSchedule = async (formData) => {
    const res = await axios.put(
      `/api/schedule/update/${schedule._id}`,
      formData
    );
    return res.data;
  };

  const deleteSchedule = async (id) => {
    await axios.delete(`/api/schedule/delete/${id}`);
  };

  const deleteManySchedule = async (listId) => {
    await axios.delete("/api/schedule/delete", {
      data: { scheduleIds: listId },
    });
  };
  // ==============================================
  // Hanlde mutation
  const mutationAdd = useMutation({
    mutationFn: addSchedule,
    onSuccess: () => {
      setSuccessToast("Thêm thành công!");
      queryClient.invalidateQueries("schedules");
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

  const mutationAddDetails = useMutation({
    mutationFn: addScheduleDetails,
    onSuccess: (data) => {
      setScheduleDetails([...scheduleDetails, data]);
      setScheduleDetailsId([...scheduleDetailsId, data._id]);
      queryClient.invalidateQueries("schedule-details");
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
    mutationFn: updateSchedule,
    onSuccess: (data) => {
      queryClient.invalidateQueries("schedules");
      setSchedule(data);
      setSuccessToast("Cập nhật thành công!");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const mutationDelete = useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries("schedules");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const mutationDeleteDetails = useMutation({
    mutationFn: deleteScheduleDetails,
    onSuccess: () => {
      const newDetailList = scheduleDetails.filter(
        (detail) => detail._id !== scheduleDetail._id
      );
      setScheduleDetails(newDetailList);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const mutationDeleteMany = useMutation({
    mutationFn: deleteManySchedule,
    onSuccess: () => {
      queryClient.invalidateQueries("schedules");
      setSelectedAll(false);
      setListSelected([]);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  // Fetch data
  const { isPending, data } = useQuery({
    queryKey: ["schedules", page, valueSearch],
    queryFn: () => fetchSchedules(page, valueSearch),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formDataToAdd]);

  // Validate on time
  useEffect(() => {
    // Validate name detail
    if (formDataToAddDetail.name !== undefined) {
      if (!formDataToAddDetail.name) {
        setNameDetailError("Vui lòng nhập trường này!");
      } else {
        setNameDetailError("");
      }
    } else {
      setNameDetailError("");
    }
    // Validate content detail
    if (formDataToAddDetail.content !== undefined) {
      if (!formDataToAddDetail.content) {
        setContentError("Vui lòng nhập trường này!");
      } else {
        setContentError("");
      }
    } else {
      setContentError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formDataToAddDetail]);

  const onUpdate = async () => {
    mutationUpdate.mutate(formDataToUpdate);
  };

  const handleDelete = () => {
    mutationDelete.mutate(schedule._id);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formDataToAdd.name) {
      setNameError("Vui lòng nhập trường này!");
      return;
    }
    mutationAdd.mutate(formDataToAdd);
  };

  useEffect(() => {
    setFormDataToAdd({ ...formDataToAdd, scheduleDetail: scheduleDetailsId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleDetailsId]);

  const handleAddDetail = (e) => {
    e.preventDefault();
    if (!formDataToAddDetail.name) {
      setNameDetailError("Vui lòng nhập trường này!");
      return;
    } else if (!formDataToAddDetail.content) {
      setContentError("Vui lòng nhập trường này!");
      return;
    }
    mutationAddDetails.mutate(formDataToAddDetail);
  };

  const handleDeleteMany = () => {
    mutationDeleteMany.mutate(listSelected);
  };

  const handleDeleteDetail = () => {
    mutationDeleteDetails.mutate(scheduleDetail._id);
  };

  const toggleSelectAll = () => {
    setSelectedAll(!selectedAll);
    if (!selectedAll) {
      setListSelected(data?.schedules.map((item) => item._id));
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
    if (page === Math.ceil(data?.totalSchedules / 9) - 1) {
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

  const handleShowDetailModal = (schedule) => {
    setFormDataToUpdate({});
    setInputModifies({});
    setSchedule(schedule);
    document.getElementById("modal-details-schedule").showModal();
  };

  const handleShowModifyModal = (schedule) => {
    setFormDataToUpdate({});
    setInputModifies({});
    setSchedule(schedule);
    document.getElementById("modal-modify-schedule").showModal();
  };

  const handleShowDeleteModal = (schedule) => {
    setSchedule(schedule);
    document.getElementById("modal-delete-schedule").showModal();
  };

  const handleShowAddModal = () => {
    document.getElementById("modal-add-schedule").showModal();
  };

  const handleShowDeleteManyModal = () => {
    document.getElementById("modal-deleteMany-schedule").showModal();
  };

  const handleShowDeleteDetailModal = (scheduleDetail) => {
    setScheduleDetail(scheduleDetail);
    document.getElementById("modal-delete-detail-schedule").showModal();
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

  const handleFormDataToAddDetail = (e) => {
    setFormDataToAddDetail({
      ...formDataToAddDetail,
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
          Quản lý lịch trình
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
                  <th>Tên lịch trình</th>
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
                {data.schedules.length !== 0 ? (
                  data.schedules.map((schedule) => (
                    <tr key={schedule._id}>
                      <th>
                        <label>
                          <input
                            checked={listSelected.includes(schedule._id)}
                            onChange={() => toggleSelectSingle(schedule._id)}
                            type="checkbox"
                            className="checkbox"
                          />
                        </label>
                      </th>
                      <td>
                        {schedule.name || (
                          <span className="italic text-sm">Chưa cập nhật</span>
                        )}
                      </td>
                      <th className="pr-0">
                        <div className="flex gap-2 flex-wrap items-center justify-end">
                          <button
                            onClick={() => handleShowDetailModal(schedule)}
                            className="text-nowrap btn btn-ghost md:btn-xs border border-black"
                          >
                            Chi tiết
                          </button>
                          <button
                            onClick={() => handleShowModifyModal(schedule)}
                            className="text-nowrap btn btn-ghost md:btn-xs border border-black"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleShowDeleteModal(schedule)}
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
        {data?.schedules.length !== 0 && (
          <div className="join mt-4 flex justify-center">
            <button
              onClick={handlePreviousPage}
              className={`join-item btn ${page === 0 && "btn-disabled"}`}
            >
              «
            </button>
            <button className="join-item btn">
              Trang {page + 1} / {Math.ceil(data?.totalSchedules / 9)}
            </button>
            <button
              onClick={handleNextPage}
              className={`join-item btn ${
                page === Math.ceil(data?.totalSchedules / 9) - 1 &&
                "btn-disabled"
              }`}
            >
              »
            </button>
          </div>
        )}
        {/* Modal details */}
        <dialog id="modal-details-schedule" className="modal">
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
                    <strong>Tên lịch trình: </strong>
                    {schedule?.name || "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Ngày tạo: </strong>
                    {moment(schedule?.createdAt).format(
                      "DD/MM/YYYY HH:mm:ss"
                    ) || "Chưa cập nhật"}
                  </h3>
                  <h3>
                    <strong>Chỉnh sửa lúc: </strong>
                    {moment(schedule?.updatedAt).format(
                      "DD/MM/YYYY HH:mm:ss"
                    ) || "Chưa cập nhật"}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </dialog>
        {/* Modal modify */}
        <dialog id="modal-modify-schedule" className="modal">
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
                    <h2 className="font-semibold flex-1">Tên lịch trình</h2>
                    <p className="flex-1">{schedule?.name || ""}</p>
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
                {/* Details */}
              </div>
            </div>
          </div>
        </dialog>
        {/* Modal delete */}
        <dialog id="modal-delete-schedule" className="modal">
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
        {/* Modal delete detail */}
        <dialog id="modal-delete-detail-schedule" className="modal">
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
                  <button
                    onClick={handleDeleteDetail}
                    className="btn btn-error"
                  >
                    Xóa
                  </button>
                </div>
              </form>
            </div>
          </div>
        </dialog>
        {/* Modal add */}
        <dialog id="modal-add-schedule" className="modal">
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
                      Tên lịch trình <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                    <MdSchedule className=" text-slate-500" />
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
                {/* Schedule details */}
                <label>
                  <div className="label p-0 py-2">
                    <span className="label-text font-bold ">
                      Chi tiết lịch trình{" "}
                      <span className="text-rose-500">*</span>
                    </span>
                  </div>
                </label>
                <div className="flex flex-col gap-2 mb-4">
                  {/* Name detail */}
                  <label className="form-control w-full">
                    <label className="input input-sm input-bordered flex items-center gap-4 focus-within:outline-sky-600">
                      <MdSchedule className=" text-slate-500" />
                      <input
                        onChange={handleFormDataToAddDetail}
                        name="name"
                        type="text"
                        className="grow"
                        placeholder="Nhập dữ liệu..."
                      />
                    </label>
                    {nameDetailError && (
                      <span className="text-rose-500 italic mt-1">
                        {nameDetailError}
                      </span>
                    )}
                  </label>
                  {/* Content */}
                  <textarea
                    onChange={handleFormDataToAddDetail}
                    name="content"
                    className="textarea textarea-bordered"
                    placeholder="Nhập nội dung"
                  ></textarea>
                  {contentError && (
                    <span className="text-rose-500 italic mt-1">
                      {contentError}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={handleAddDetail} className="btn">
                    <FaPlusCircle className="text-2xl text-sky-600" />
                  </button>
                </div>
                {/* Render list schedule details */}
                <div className="border p-4 mt-4">
                  <h3 className="font-bold">Danh sách chi tiết</h3>
                  {scheduleDetails.length !== 0 &&
                    scheduleDetails.map((item) => (
                      <div
                        onClick={() => handleShowDeleteDetailModal(item)}
                        className="bg-slate-300 p-2 mt-2 rounded-md flex justify-between items-center"
                        key={item._id}
                      >
                        <h3>{item.name}</h3>
                        <button className="btn btn-sm">Xóa</button>
                      </div>
                    ))}
                </div>
              </div>
              <div className="flex justify-center w-full mt-10">
                <div className="w-full md:w-1/2">
                  <button
                    type="submit"
                    disabled={isPending}
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
        <dialog id="modal-deleteMany-schedule" className="modal">
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

export default DashSchedule;
