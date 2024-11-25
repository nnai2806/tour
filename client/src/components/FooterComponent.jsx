import { FaFacebook, FaTwitter, FaYoutube } from "react-icons/fa";

const FooterComponent = () => {
  return (
    <footer className="footer footer-center bg-sky-100 text-base-content rounded p-10">
      <nav className="grid grid-flow-col gap-4">
        <a className="link link-hover">Về chúng tôi</a>
        <a className="link link-hover">Liên hệ</a>
        <a className="link link-hover">Tuyển dụng</a>
        <a className="link link-hover">Địa chỉ</a>
      </nav>
      <nav>
        <div className="grid grid-flow-col gap-4">
          <a>
            <FaFacebook className="text-2xl hover:opacity-70 cursor-pointer" />
          </a>
          <a>
            <FaYoutube className="text-2xl hover:opacity-70 cursor-pointer" />
          </a>
          <a>
            <FaTwitter className="text-2xl hover:opacity-70 cursor-pointer" />
          </a>
        </div>
      </nav>
      <aside>
        <p>
          Copyright © {new Date().getFullYear()} - Bản quyền của Travel Việt.
        </p>
      </aside>
    </footer>
  );
};

export default FooterComponent;
