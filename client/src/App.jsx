import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import FooterComponent from "./components/FooterComponent";
import PrivateRoute from "./components/PrivateRoute";
import PrivateRouteForAdmin from "./components/PrivateRouteForAdmin";
import { lazy, Suspense } from "react";
import Loading from "./components/Loading";
import ScrollToTop from "./components/ScrollToTop";
import PageNotFound from "./pages/PageNotFound";
// import MapButton from "./components/MapButton";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const DestinationPage = lazy(() => import("./pages/DestinationPage"));
const TourPage = lazy(() => import("./pages/TourPage"));
const NewsPage = lazy(() => import("./pages/NewsPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const CreatePostPage = lazy(() => import("./pages/CreatePostPage"));
const ViewPostPage = lazy(() => import("./pages/ViewPostPage"));
const UpdatePostPage = lazy(() => import("./pages/UpdatePostPage"));
const ProvincePage = lazy(() => import("./pages/ProvincePage"));
const ViewTourPage = lazy(() => import("./pages/ViewTourPage"));
const ViewProvincePage = lazy(() => import("./pages/ViewProvincePage"));
const ViewDestinationPage = lazy(() => import("./pages/ViewDestinationPage"));
const OrderTour = lazy(() => import("./pages/OrderTour"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="*" element={<PageNotFound />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/diem-den" element={<DestinationPage />} />
          <Route path="/tour" element={<TourPage />} />
          <Route path="/tin-tuc" element={<NewsPage />} />
          <Route path="/khu-vuc" element={<ProvincePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/post/v/:postId" element={<ViewPostPage />} />
          <Route path="/tour/v/:tourId" element={<ViewTourPage />} />
          <Route
            path="/province/v/:provinceId"
            element={<ViewProvincePage />}
          />
          <Route
            path="/destination/v/:destinationId"
            element={<ViewDestinationPage />}
          />
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/order/:tourId" element={<OrderTour />} />
          </Route>
          <Route element={<PrivateRouteForAdmin />}>
            <Route path="/create-post" element={<CreatePostPage />} />
            <Route path="/post/ud/:postId" element={<UpdatePostPage />} />
          </Route>
        </Routes>
        <FooterComponent />
        {/* <MapButton /> */}
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
