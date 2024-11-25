import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { FaLocationDot } from "react-icons/fa6";
import { useEffect } from "react";

const SearchHome = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [valueSearch] = useDebounce(searchText, 500);
  const [focus, setFocus] = useState(false);
  const [tourSelected, setTourSelected] = useState(null);
  const [locationLatLng, setLocationLatLng] = useState([]);
  const [centreLocationLatLng, setCentreLocationLatLng] = useState(null);

  const [loading, setLoading] = useState(false);

  // Method call API
  const fetchTours = async (valueSearch) => {
    const res = await axios.get(`/api/tour/get?search=${valueSearch}`);
    return res.data;
  };

  // Fetch data
  const { data } = useQuery({
    queryKey: ["tours", valueSearch],
    queryFn: () => fetchTours(valueSearch),
    placeholderData: keepPreviousData,
  });

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
    for (const location of tourSelected.destinations) {
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
    if (tourSelected) {
      getLocationsWithLatLng();
      fetchCenterCoordinates(tourSelected.destinations[0].province.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourSelected]);

  return (
    <div className="mt-6">
      <div className="pt-10 flex flex-col items-center relative">
        <label className="input input-bordered w-full md:w-2/3 flex items-center gap-2 mb-4 shadow-md">
          <input
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            type="text"
            className="grow"
            placeholder="Tìm kiếm"
          />
          <FaSearch />
        </label>
        {focus && (
          <ul className="bg-sky-100 w-full md:w-2/3 p-2 rounded-md -mt-2 shadow-md absolute top-28 z-10">
            {data.tours.map((item) => (
              <li
                onMouseDown={() => navigate(`/tour/v/${item._id}`)}
                className="flex items-center justify-between py-2 border border-sky-800 px-4 text-sky-800 hover:bg-sky-200 rounded-md mb-2 cursor-pointer"
                key={item._id}
              >
                <p className="line-clamp-1">{item.name}</p>
                <button
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setTourSelected(item);
                    if (!loading) {
                      document.getElementById("map").showModal();
                    }
                  }}
                  className="btn bg-sky-700 btn-sm text-rose-500"
                >
                  <FaLocationDot />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal show map */}
      <dialog id="map" className="modal">
        <div className="modal-box w-11/12 max-w-5xl">
          <h3 className="font-bold text-lg text-sky-700">
            Bản đồ: {tourSelected?.name}
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
    </div>
  );
};

export default SearchHome;
