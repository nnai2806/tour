import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

const ImageGalleryComponent = ({ images }) => {
  const formattedImages = images.map((image) => ({
    original: image,
    thumbnail: image,
  }));

  return (
    <div className="container mx-auto p-4 w-full">
      <ImageGallery
        items={formattedImages}
        showThumbnails={true}
        thumbnailPosition="left"
        showPlayButton={false}
        showFullscreenButton={false}
      />
    </div>
  );
};

export default ImageGalleryComponent;
