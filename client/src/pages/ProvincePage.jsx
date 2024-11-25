import { Link, useNavigate } from "react-router-dom";
import Container from "../components/Container";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import axios from "axios";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const ProvincePage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [valueSearch] = useDebounce(searchText, 500);

  const fetchProvinces = async (page = 0, valueSearch) => {
    const res = await axios.get(
      `/api/province/get?page=${page}&search=${valueSearch}`
    );
    return res.data;
  };

  // Fetch data
  const { data } = useQuery({
    queryKey: ["provinces", page, valueSearch],
    queryFn: () => fetchProvinces(page, valueSearch),
    placeholderData: keepPreviousData,
  });

  const handleNextPage = () => {
    if (page === Math.ceil(data?.totalProvinces / 9) - 1) {
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
            <li className="underline">Khu vực</li>
          </ul>
        </div>

        {/* Province section */}
        <div>
          <h1 className="text-center text-3xl uppercase font-bold text-sky-600 my-8">
            Khu vực
          </h1>
          {/* Search */}
          <div className="flex justify-center">
            <label className="input input-bordered w-1/2 flex items-center gap-2 mb-4">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                type="text"
                className="grow"
                placeholder="Tìm kiếm"
              />
              <FaSearch />
            </label>
          </div>
          {/* List provinces */}
          <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2">
            {data?.provinces.map((item) => (
              <div
                onClick={() => navigate(`/province/v/${item._id}`)}
                key={item._id}
                className="card glass hover:brightness-75 cursor-pointer"
              >
                <div className="card-body">
                  <h2 className="card-title line-clamp-2">{item.title}</h2>
                  {/* Name */}
                  <p className="text-xl font-bold line-clamp-2">{item.name}</p>
                  {/* Description */}
                  <p className="line-clamp-2">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination */}
          {data?.provinces.length !== 0 && (
            <div className="join mt-4 flex justify-center">
              <button
                onClick={handlePreviousPage}
                className={`join-item btn ${page === 0 && "btn-disabled"}`}
              >
                «
              </button>
              <button className="join-item btn">
                Trang {page + 1} / {Math.ceil(data?.totalProvinces / 9)}
              </button>
              <button
                onClick={handleNextPage}
                className={`join-item btn ${
                  page === Math.ceil(data?.totalProvinces / 9) - 1 &&
                  "btn-disabled"
                }`}
              >
                »
              </button>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default ProvincePage;
