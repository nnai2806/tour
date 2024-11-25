import { Link, useNavigate, useParams } from "react-router-dom";
import Container from "../components/Container";
import axios from "axios";
import { useEffect, useState } from "react";
import moment from "moment";
import { IoTime } from "react-icons/io5";
import "react-quill/dist/quill.snow.css";
import PostImg from "../assets/images/post.png";

const ViewPostPage = () => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [otherPosts, setOtherPosts] = useState([]);

  //  Get other posts
  useEffect(() => {
    const getOtherPosts = async () => {
      const res = await axios.get("/api/post/get?limit=4");
      setOtherPosts(res.data.posts);
      setOtherPosts((prev) => prev.filter((item) => item._id !== postId));
    };
    if (postId) {
      getOtherPosts();
    }
  }, [postId]);

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
      <div>
        {/* Breadscrumbs section */}
        <div className="breadcrumbs">
          <ul>
            <li>
              <Link to={"/"}>Trang chủ</Link>
            </li>
            <li>
              <Link to={"/tin-tuc"}>Tin tức</Link>
            </li>
            <li className="underline">{post?.title}</li>
          </ul>
        </div>

        {/* Content post section */}
        <div>
          {/* Title */}
          <h1 className="text-center text-3xl font-bold my-10">
            {post?.title}
          </h1>
          <div className="text-sky-600 flex justify-between p-[15px]">
            {/* Author */}
            <p>Tác giả: {post?.user?.fullName}</p>
            {/* Created at */}
            <p className="flex items-center gap-2 italic">
              <IoTime />
              {moment(post?.createdAt).format("DD/MM/yyyy HH:ss")}
            </p>
          </div>
          {/* Content */}
          <div
            className="ql-editor"
            dangerouslySetInnerHTML={{ __html: post?.content }}
          ></div>
          {/* Other posts */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-sky-600 py-4">
              Các bài viết khác
            </h2>
            <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-4">
              {otherPosts.map((item) => (
                <div
                  onClick={() => navigate(`/post/v/${item._id}`)}
                  key={item._id}
                  className="card glass hover:brightness-75 cursor-pointer"
                >
                  <figure>
                    <img
                      className="w-full h-56 object-cover object-center hover:animate-pulse"
                      src={item?.image === "img" ? PostImg : item?.image}
                      alt="post"
                    />
                  </figure>
                  <div className="card-body">
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
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ViewPostPage;
