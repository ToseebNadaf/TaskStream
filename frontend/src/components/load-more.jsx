const LoadMoreDataBtn = ({ state, fetchDataFun, additionalParam }) => {
  if (state != null && state.totalDocs > state.results.length) {
    return (
      <div className="flex justify-center my-6">
        <button
          onClick={() =>
            fetchDataFun({ ...additionalParam, page: state.page + 1 })
          }
          className="text-white p-2 px-4 bg-black rounded-md shadow-md flex items-center gap-2"
        >
          Load More
        </button>
      </div>
    );
  }
  return null;
};

export default LoadMoreDataBtn;
