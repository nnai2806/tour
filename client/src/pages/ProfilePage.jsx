import { Link, useLocation } from "react-router-dom";
import Container from "../components/Container";
import AvatarDefault from "../assets/images/avatar.png";
import { FaHeart, FaKey, FaUser } from "react-icons/fa";
import { TbBrandBooking } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import ProfileInfo from "../components/ProfileComponents/ProfileInfo";
import ChangePassword from "../components/ProfileComponents/ChangePassword";
import ProfileBooking from "../components/ProfileComponents/ProfileBooking";
import ProfileLike from "../components/ProfileComponents/ProfileLike";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { updateSuccess } from "../redux/user/userSlice";

const ProfilePage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const imagePickerRef = useRef();

  const location = useLocation();
  const [tab, setTab] = useState("info");

  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.warning("Tệp phải ít hơn 2MB!");
      return;
    }
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile]);

  const uploadImage = async () => {
    setImageFileUploading(true);
    const storage = getStorage(app);
    const fileName = "avatar_" + currentUser._id;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageFileUploadProgress(progress.toFixed(0));
      },
      (error) => {
        console.log(error);
        setImageFileUploadProgress(null);
        setImageFile(null);
        setImageFileUrl(null);
        setImageFileUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setImageFileUploading(false);
        });
      }
    );
  };

  useEffect(() => {
    const updateImage = async () => {
      try {
        const res = await axios.put(`/api/user/update/${currentUser._id}`, {
          image: imageFileUrl,
        });
        if (res.status === 200) {
          dispatch(updateSuccess({ ...currentUser, image: imageFileUrl }));
          setImageFileUploadProgress(null);
          toast.success("Cập nhật thành công!");
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (imageFileUploadProgress == 100 && !imageFileUploading) {
      updateImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFileUrl]);

  return (
    <Container>
      <div>
        {/* Breadscrumbs section */}
        <div className="breadcrumbs">
          <ul>
            <li>
              <Link to={"/"}>Trang chủ</Link>
            </li>
            <li className="underline">Tài khoản</li>
          </ul>
        </div>

        {/* Profile section */}
        <div>
          <h1 className="text-center text-3xl uppercase font-bold text-sky-600 my-8">
            Tài khoản của bạn
          </h1>
          <div className="flex gap-8 flex-col md:flex-row">
            {/* Menu */}
            <ul className="menu menu-lg bg-base-200 rounded-md md:w-96 shadow-md border py-8">
              <div className="flex flex-col items-center">
                {/* Avatar */}
                <input
                  onChange={handleAvatarChange}
                  accept="image/*"
                  ref={imagePickerRef}
                  hidden
                  type="file"
                />
                <div
                  onClick={() => imagePickerRef.current.click()}
                  className="avatar cursor-pointer hover:brightness-75"
                >
                  <div className="w-32 border-2 rounded-md shadow-md hover:border-sky-600">
                    <img
                      src={currentUser.image || AvatarDefault}
                      alt="avatar"
                    />
                  </div>
                </div>

                {/* Progress upload image */}
                {imageFileUploadProgress && (
                  <progress
                    className="progress progress-info w-32 my-4"
                    value={imageFileUploadProgress || 0}
                    max="100"
                  ></progress>
                )}

                {/* Name and email */}
                <h1 className="text-xl font-bold my-2 text-sky-600">
                  {currentUser.fullName}
                </h1>
                <h3 className="italic mb-2">{currentUser.email}</h3>
              </div>
              <li>
                <Link
                  className={`${tab === "info" && "active"}`}
                  to={"?tab=info"}
                >
                  <FaUser />
                  Thông tin cá nhân
                </Link>
              </li>
              <li>
                <Link
                  className={`${tab === "password" && "active"}`}
                  to={"?tab=password"}
                >
                  <FaKey />
                  Đổi mật khẩu
                </Link>
              </li>
              <li>
                <Link
                  className={`${tab === "booking" && "active"}`}
                  to={"?tab=booking"}
                >
                  <TbBrandBooking />
                  Đơn đặt chỗ
                </Link>
              </li>
              <li>
                <Link
                  className={`${tab === "like" && "active"}`}
                  to={"?tab=like"}
                >
                  <FaHeart />
                  Yêu thích
                </Link>
              </li>
            </ul>
            {/* Display content each menu */}
            <div className="w-full">
              {/* Info */}
              {tab === "info" && <ProfileInfo />}
              {/* Change password */}
              {tab === "password" && <ChangePassword />}
              {/* Booking list */}
              {tab === "booking" && (
                <ProfileBooking currentUser={currentUser} />
              )}
              {/* Like list */}
              {tab === "like" && <ProfileLike />}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-center" />
    </Container>
  );
};

export default ProfilePage;
