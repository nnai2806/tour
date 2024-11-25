/* eslint-disable react/prop-types */
const Container = ({ children }) => {
  return (
    <div className="flex justify-center relative">
      <div className="pt-[100px] p-6 w-full max-w-[1248px] min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default Container;
