import axios from "axios";
import Container from "../components/Container";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import PostImg from "../assets/images/post.png";

const modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
  ],
};

const UpdatePostPage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [formData, setFormData] = useState({});

  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);

  const handleChange = (content) => {
    setFormData({ ...formData, content: content });
  };

  const handleImageChange = (e) => {
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

  const handleFormData = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value.trim(),
    });
  };

  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile]);

  useEffect(() => {
    if (imageFileUploadProgress == 100 && !imageFileUploading) {
      setFormData({ ...formData, image: imageFileUrl });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFileUrl]);

  const uploadImage = async () => {
    setImageFileUploading(true);
    const storage = getStorage(app);
    const fileName = `post/post-by-${currentUser._id}-${formData.title}`;
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

  const updatePostAPI = async () => {
    const res = await axios.put(`/api/post/update/${postId}`, {
      ...formData,
    });
    return res.data;
  };

  const mutationCreatePost = useMutation({
    mutationFn: updatePostAPI,
    onSuccess: (data) => {
      toast.success("Cập nhật bài viết thành công!");
      setTimeout(() => {
        navigate(`/post/v/${data._id}`);
      }, 1000);
    },
    onError: (error) => {
      const { message } = error.response.data;
      if (message) {
        toast.error(message);
      }
    },
  });

  const handleUpdatePost = () => {
    mutationCreatePost.mutate();
  };

  // Get post
  useEffect(() => {
    const getPostById = async () => {
      const res = await axios.get(`/api/post/get?id=${postId}`);
      setPost(res.data.posts[0]);
    };
    if (postId) {
      getPostById();
    }
  }, [postId]);
  return (
    <Container>
      <h1 className="text-2xl font-bold uppercase text-sky-600 text-center my-4">
        Chỉnh sửa bài viết
      </h1>
      <div className="my-4">
        <input
          defaultValue={post?.title}
          onChange={handleFormData}
          name="title"
          type="text"
          placeholder="Nhập tiêu đề bài viết..."
          className="input input-bordered w-full"
        />
      </div>
      <div className="mb-4">
        <input
          onChange={handleImageChange}
          type="file"
          className="file-input file-input-bordered w-full max-w-xs"
        />{" "}
      </div>
      {/* Render image */}
      <div className="flex justify-center">
        {imageFileUrl ? (
          <div className="flex flex-col mb-4 w-1/2">
            {imageFileUploadProgress && (
              <progress
                className="progress progress-primary"
                value={imageFileUploadProgress}
                max="100"
              ></progress>
            )}
            <img src={imageFileUrl} alt="img" />
          </div>
        ) : (
          <img src={post?.image === "img" ? PostImg : post?.image} alt="img" />
        )}
      </div>
      <div className="mb-20">
        <ReactQuill
          value={formData.content || post?.content}
          className="h-96"
          onChange={handleChange}
          modules={modules}
          placeholder="Nhập nội dung bài viết..."
          theme="snow"
        />
      </div>
      <div className="float-right">
        <button
          onClick={handleUpdatePost}
          className={`btn btn-primary ${imageFileUploading && "btn-disabled"}`}
        >
          Cập nhật
        </button>
      </div>
      <ToastContainer />
    </Container>
  );
};

export default UpdatePostPage;
