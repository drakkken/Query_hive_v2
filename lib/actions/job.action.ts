export const fetchLocation = async () => {
  try {
    const response = await fetch("http://ip-api.com/json/?fields=country");
    const location = await response.json();
    return location.country ?? "";
  } catch (error) {
    console.log(error);
    return "";
  }
};

export const fetchCountries = async () => {
  try {
    const response = await fetch(
      "https://restcountries.com/v3.1/all?fields=name"
    );
    const result = await response.json();
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const fetchJobs = async (filters: JobFilterParams) => {
  const { query, page } = filters;

  const headers = {
    "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPID_API_KEY ?? "",
    "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
  };

  try {
    const response = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(
        query
      )}&page=${page}`,
      {
        headers,
      }
    );

    const result = await response.json();

    return Array.isArray(result?.data) ? result.data : [];
  } catch (error) {
    console.log(error);
    return [];
  }
};
