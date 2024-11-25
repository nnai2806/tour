import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Carousel1 from "../../assets/images/carousel_1.jpg";

var settings = {
  arrows: false,
  dots: true,
  infinite: true,
  speed: 500,
  autoplay: true,
  slidesToShow: 1,
  slidesToScroll: 1,
};

const CarouselHome = () => {
  return (
    <div className="-mx-6">
      <Slider {...settings}>
        <div>
          <img
            className="w-full h-96 object-cover object-center"
            src={Carousel1}
            alt="Carousel1"
          />
        </div>
        <div>
          <img
            className="w-full h-96 object-cover object-center"
            src={Carousel1}
            alt="Carousel1"
          />
        </div>
        <div>
          <img
            className="w-full h-96 object-cover object-center"
            src={Carousel1}
            alt="Carousel1"
          />
        </div>
      </Slider>
    </div>
  );
};

export default CarouselHome;
