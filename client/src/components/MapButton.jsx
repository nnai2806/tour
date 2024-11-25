import { FaMap } from "react-icons/fa";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapButton = () => {
  return (
    <div className="fixed bottom-10 right-10 z-50">
      <button
        onClick={() => document.getElementById("map-glb").showModal()}
        className="btn btn-circle btn-primary"
      >
        <FaMap />
      </button>
      {/* Modal show map */}
      <dialog id="map-glb" className="modal">
        <div className="modal-box w-11/12 max-w-5xl">
          <h3 className="font-bold text-lg text-sky-700">Bản đồ:</h3>
          <div className="py-4">
            <div className="">
              <MapContainer
                center={[10.0452, 105.7469]}
                zoom={13} // Mức phóng to
                style={{ height: "500px", width: "100%" }}
              >
                {/* TileLayer để hiển thị bản đồ */}
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
              </MapContainer>
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

export default MapButton;
