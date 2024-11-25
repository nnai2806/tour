import CarouselHome from "../components/HomeComponents/CarouselHome";
import Container from "../components/Container";
import SearchHome from "../components/HomeComponents/SearchHome";
import OutstandingHome from "../components/HomeComponents/OutstandingHome";
import MoreTourHome from "../components/HomeComponents/MoreTourHome";

const HomePage = () => {
  return (
    <Container>
      <CarouselHome />
      <SearchHome />
      <OutstandingHome />
      <MoreTourHome />
    </Container>
  );
};

export default HomePage;
