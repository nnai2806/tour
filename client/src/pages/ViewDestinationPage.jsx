import { Link, useNavigate, useParams } from "react-router-dom";
import Container from "../components/Container";
import { useEffect, useState } from "react";
import axios from "axios";

const ViewDestinationPage = () => {
  const navigate = useNavigate();
  const { destinationId } = useParams();
  const [destination, setDestination] = useState(null);
  const [toursOfDestination, setToursOfDestination] = useState([]);
  const [otherDestinations, setOtherDestinations] = useState([]);

  //  Get tour of this destination
  useEffect(() => {
    const getToursOfDestination = async () => {
      const res = await axios.get(
        `/api/tour/get?limit=4&destinations=${destinationId}`
      );
      setToursOfDestination(res.data.tours);
    };
    if (destinationId) {
      getToursOfDestination();
    }
  }, [destinationId]);

  //  Get other destinations
  useEffect(() => {
    const getOtherDestinations = async () => {
      const res = await axios.get("/api/destination/get?limit=4");
      setOtherDestinations(res.data.destinations);
      setOtherDestinations((prev) =>
        prev.filter((item) => item._id !== destinationId)
      );
    };
    if (destinationId) {
      getOtherDestinations();
    }
  }, [destinationId]);

  // Get destination
  useEffect(() => {
    const getDestinationById = async () => {
      const res = await axios.get(`/api/destination/get?id=${destinationId}`);
      setDestination(res.data.destinations[0]);
    };
    if (destinationId) {
      getDestinationById();
    }
  }, [destinationId]);

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
              <Link to={"/diem-den"}>Điểm đến</Link>
            </li>
            <li className="underline">{destination?.name}</li>
          </ul>
        </div>
        {/* Content destionation section */}
        <div>
          {/* Name */}
          <h1 className="text-center text-3xl font-bold my-10">
            {destination?.name}
          </h1>
          {/* Province */}
          <p
            onClick={() =>
              navigate(`/province/v/${destination?.province?._id}`)
            }
            className="my-4 badge badge-info badge-lg font-bold text-white cursor-pointer hover:scale-105 active:scale-100"
          >
            {destination?.province?.name}
          </p>
          {/* Description */}
          <p className="">{destination?.description}</p>
          {/* Images */}
          <div>
            <h2 className="text-xl font-bold text-sky-600 my-4">
              Các hình ảnh về {destination?.name}:
            </h2>
            {destination?.images.map((item) => (
              <div key={item} className="mb-2">
                <img className="w-full" src={item} alt={item} />
              </div>
            ))}
          </div>
          {/* Tour has this destination */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-sky-600 py-4">
              Các tour ở đây
            </h2>
            {/* List tours */}
            {toursOfDestination.length === 0 && (
              <p className="font-bold italic">Chưa có tour nào</p>
            )}
            <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-4">
              {toursOfDestination.map((item) => (
                <div
                  onClick={() => navigate(`/tour/v/${item._id}`)}
                  key={item._id}
                  className="card glass hover:brightness-75 cursor-pointer"
                >
                  <figure>
                    <img
                      className="w-full h-56 object-cover object-center hover:animate-pulse"
                      src={item?.images[0]}
                      alt="tour"
                    />
                  </figure>
                  <div className="card-body">
                    <h2 className="card-title line-clamp-2">{item.title}</h2>
                    {/* Name */}
                    <p className="text-xl font-bold line-clamp-2">
                      {item.name}
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
        </div>

        {/* Other destinations */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-sky-600 py-4">
            Các điểm đến khác
          </h2>
          {/* List destinations */}
          <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-4">
            {otherDestinations.map((item) => (
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
                  <p className="text-xl font-bold line-clamp-2">{item.name}</p>
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
      </div>
    </Container>
  );
};

export default ViewDestinationPage;
