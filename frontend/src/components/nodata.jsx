const NoDataMessage = ({ message = "No data available" }) => {
  return (
    <div
      className="text-center w-full p-4 rounded-lg bg-grey/50 mt-4"
      role="alert"
      aria-live="assertive"
    >
      <p className="text-sm font-medium text-dark-grey">{message}</p>
    </div>
  );
};

export default NoDataMessage;
