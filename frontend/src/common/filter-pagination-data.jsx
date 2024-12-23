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
  let obj;

  const headers = user ? { Authorization: `${user}` } : {};

  try {
    if (state !== null && !create_new_arr) {
      obj = { ...state, results: [...state.results, ...data], page };
    } else {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}${countRoute}`,
        data_to_send,
        { headers }
      );

      const { totalDocs } = response.data;
      obj = { results: data, page: 1, totalDocs };
    }
  } catch (err) {
    console.error("Error fetching pagination data:", err);
  }

  return obj;
};
