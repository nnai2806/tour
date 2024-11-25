import Container from "../components/Container";
import PageNotFoundImg from "../assets/images/not-found.png";

const PageNotFound = () => {
  return (
    <Container>
      <div className="flex justify-center mt-44">
        <img
          className="shadow-lg rounded-full border shadow-sky-800"
          src={PageNotFoundImg}
          alt="page-not-found"
        />
      </div>
    </Container>
  );
};

export default PageNotFound;
