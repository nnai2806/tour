const Loading = () => {
  return (
    <div
      className="flex justify-center items-center fixed top-0 left-0 w-screen h-screen
        z-20 bg-slate-200 bg-opacity-50"
    >
      <span className="loading loading-ring loading-lg text-sky-600"></span>
    </div>
  );
};

export default Loading;
