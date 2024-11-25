import { Link, useNavigate, useParams } from "react-router-dom";
import Container from "../components/Container";
import { useEffect, useState } from "react";
import axios from "axios";

const ViewProvincePage = () => {
  const navigate = useNavigate();
  const { provinceId } = useParams();
  const [province, setProvince] = useState(null);
  const [otherProvinces, setOtherProvinces] = useState([]);
  const [destinations, setDestionations] = useState([]);

  //   Get destinations by province _id
  useEffect(() => {
    const getDestinationsByProvinceId = async () => {
      const res = await axios.get(
        `/api/destination/get?province=${provinceId}&limit=100000`
      );
      setDestionations(res.data.destinations);
    };
    if (provinceId) {
      getDestinationsByProvinceId();
    }
  }, [provinceId]);

  //  Get other provinces
  useEffect(() => {
    const getOtherProvinces = async () => {
      const res = await axios.get("/api/province/get?limit=8");
      setOtherProvinces(res.data.provinces);
      setOtherProvinces((prev) =>
        prev.filter((item) => item._id !== provinceId)
      );
    };
    if (provinceId) {
      getOtherProvinces();
    }
  }, [provinceId]);

  // Get province
  useEffect(() => {
    const getProvinceById = async () => {
      const res = await axios.get(`/api/province/get?id=${provinceId}`);
      setProvince(res.data.provinces[0]);
    };
    if (provinceId) {
      getProvinceById();
    }
  }, [provinceId]);

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
              <Link to={"/khu-vuc"}>Khu vực</Link>
            </li>
            <li className="underline">{province?.name}</li>
          </ul>
        </div>
        {/* Content province section */}
        <div>
          {/* Name */}
          <h1 className="text-center text-3xl font-bold my-10">
            {province?.name}
          </h1>
          {/* Description */}
          <p className="italic text-xl text-center text-sky-600">
            {province?.description}
          </p>
          {/* List destination of this province */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-sky-600 py-4">
              Các điểm đến ở {province?.name}
            </h2>
            {destinations.length === 0 && (
              <p className="text-center text-slate-500">
                Chưa có điểm đến ở đây
              </p>
            )}
            {/* List destinations */}
            <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-4">
              {destinations.map((item) => (
                <div
                  onClick={() => navigate(`/destination/v/${item._id}`)}
                  key={item._id}
                  className="card glass hover:brightness-75 cursor-pointer"
                >
                  <figure>
                    <img
                      className="w-full h-56 object-cover object-center hover:animate-pulse"
                      src={item?.images[0]}
                      alt="destination"
                    />
                  </figure>
                  <div className="card-body">
                    <h2 className="card-title line-clamp-2">{item.title}</h2>
                    {/* Name */}
                    <p className="text-xl font-bold line-clamp-2">
                      {item.name}
                    </p>
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
          </div>
          {/* Other provinces */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-sky-600 py-4">
              Các tỉnh thành khác
            </h2>
            {/* List provinces */}
            <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-4">
              {otherProvinces.map((item) => (
                <div
                  onClick={() => navigate(`/province/v/${item._id}`)}
                  key={item._id}
                  className="card glass hover:brightness-75 cursor-pointer"
                >
                  <div className="card-body">
                    <h2 className="card-title line-clamp-2">{item.title}</h2>
                    {/* Name */}
                    <p className="text-xl font-bold line-clamp-2">
                      {item.name}
                    </p>
                    {/* Description */}
                    <p className="line-clamp-2">{item.description}</p>
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

export default ViewProvincePage;
