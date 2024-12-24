import axios from "axios";

export const filterPaginationData = async ({
  create_new_arr = false,
  state,
  data,
  page,
  countRoute,
  data_to_send = {},
  user = undefined,
}) => {
  const headers = user ? { Authorization: `${user}` } : {};
  let resultObj = null;

  try {
    if (state && !create_new_arr) {
      resultObj = {
        ...state,
        results: [...state.results, ...data],
        page,
      };
    } else {
      const { data: response } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}${countRoute}`,
        data_to_send,
        { headers }
      );

      const { totalDocs } = response;
      resultObj = {
        results: data,
        page: 1,
        totalDocs,
      };
    }
  } catch (error) {
    console.error("Error fetching pagination data:", error);
    throw new Error(
      "Unable to fetch or process pagination data. Please try again later."
    );
  }

  return resultObj;
};
