import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "../firebase";
import { signInSuccess } from "../redux/user/userSlice";
import axios from "axios";
import { useState } from "react";
import Loading from "./Loading";

const GoogleAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = getAuth(app);
  const [isLoading, setLoading] = useState(false);

  const handleGoogleClick = async (event) => {
    event.preventDefault();
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const res = await axios.post("/api/auth/google", {
        fullName: result.user.displayName,
        email: result.user.email,
        image: result.user.photoURL,
      });
      if (res) {
        dispatch(signInSuccess(res.data));
        setTimeout(() => {
          navigate("/");
          setLoading(false);
        }, 1000);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loading />}
      <button
        onClick={handleGoogleClick}
        className="flex items-center justify-center gap-4 w-full text-base font-semibold text-black bg-base-100 p-4 rounded-3xl border hover:bg-slate-200"
      >
        <FcGoogle className="text-2xl" />
        <span>Tiếp tục với Google</span>
      </button>
    </>
  );
};

export default GoogleAuth;
