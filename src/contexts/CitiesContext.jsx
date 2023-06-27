import { createContext, useEffect, useContext, useReducer } from "react";

const URL = "http://localhost:8000/cities";

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

const CitiesContext = createContext();

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return {
        ...state,
        isLoading: true,
        error: "",
      };
    case "cities/loaded":
      return {
        ...state,
        isLoading: false,
        cities: action.payload,
        error: "",
      };
    case "city/loaded":
      return {
        ...state,
        isLoading: false,
        error: "",
        currentCity: action.payload,
      };
    case "city/created":
      return {
        ...state,
        isLoading: false,
        error: "",
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
      };
    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        error: "",
        cities: state.cities.filter((city) => city.id !== action.payload),
        currentCity: {},
      };
    case "rejected":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    default:
      return [...initialState];
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity }, dispatch] = useReducer(
    reducer,
    initialState
  );

  useEffect(() => {
    async function fetchCities() {
      dispatch({ type: "loading" });
      try {
        const res = await fetch(URL);
        const data = await res.json();
        dispatch({ type: "cities/loaded", payload: data });
      } catch {
        dispatch({ type: "rejected", payload: "unable to fetch data" });
      }
    }
    fetchCities();
  }, []);

  async function getCity(id) {
    dispatch({ type: "loading" });
    try {
      const res = await fetch(`${URL}/${id}`);
      const data = await res.json();
      dispatch({ type: "city/loaded", payload: data });
    } catch {
      dispatch({ type: "rejected", payload: "unable to fetch city data" });
    }
  }

  async function createCity(city) {
    dispatch({ type: "loading" });
    try {
      const res = await fetch(URL, {
        method: "POST",
        body: JSON.stringify(city),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      dispatch({ type: "city/created", payload: data });
      return data;
    } catch {
      dispatch({ type: "rejected", payload: "unable to create a city" });
    }
  }

  async function DeleteCity(id) {
    dispatch({ type: "loading" });
    try {
      await fetch(`${URL}/${id}`, {
        method: "DELETE",
      });
      dispatch({ type: "city/deleted", payload: id });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error deleting the city",
      });
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        getCity,
        createCity,
        DeleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  return useContext(CitiesContext);
}

export { CitiesProvider, useCities };
