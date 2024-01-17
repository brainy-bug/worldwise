/* eslint-disable react/prop-types */
import {
  createContext,
  useEffect,
  useReducer,
  useContext,
  useCallback,
} from "react";

const CitiesContext = createContext();

const BASE_URL = "http://localhost:3001";

const initialState = {
  cities: [],
  isLoading: true,
  currentCity: {},
};

const reducer = (state, action) => {
  switch (action.type) {
    case "cities/loaded":
      return {
        ...state,
        cities: action.payload,
        isLoading: false,
      };

    case "cities/created":
      return {
        ...state,
        cities: [...state.cities, action.payload],
        isLoading: false,
      };
    case "cities/deleted":
      return {
        ...state,
        cities: state.cities.filter((city) => city.id !== action.payload),
        isLoading: false,
      };

    case "cities/currentCity":
      return {
        ...state,
        currentCity: action.payload,
        isLoading: false,
      };

    case "cities/error":
      return {
        ...state,
        isLoading: false,
      };

    default:
      return state;
  }
};

const CitiesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(`${BASE_URL}/cities`);
        const data = await response.json();
        dispatch({ type: "cities/loaded", payload: data });
      } catch (error) {
        dispatch({ type: "cities/error" });
      }
    };

    fetchCities();
  }, []);

  const getCity = useCallback(
    async (id) => {
      if (Number(id) === state.currentCity.id) return;

      try {
        const response = await fetch(`${BASE_URL}/cities/${id}`);
        const data = await response.json();
        dispatch({ type: "cities/currentCity", payload: data });
      } catch (error) {
        dispatch({ type: "cities/error" });
      }
    },
    [state.currentCity.id]
  );

  const createCity = async (city) => {
    try {
      const response = await fetch(`${BASE_URL}/cities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(city),
      });
      const data = await response.json();
      dispatch({ type: "cities/created", payload: data });
    } catch (error) {
      dispatch({ type: "cities/error" });
    }
  };

  const deleteCity = async (id) => {
    try {
      await fetch(`${BASE_URL}/cities/${id}`, {
        method: "DELETE",
      });
      dispatch({ type: "cities/deleted", payload: id });
    } catch (error) {
      dispatch({ type: "cities/error" });
    }
  };

  const values = {
    ...state,
    getCity,
    createCity,
    deleteCity,
  };

  return (
    <CitiesContext.Provider value={values}>{children}</CitiesContext.Provider>
  );
};

const useCities = () => {
  const context = useContext(CitiesContext);

  if (!context) {
    throw new Error("useCities must be used within a CitiesProvider");
  }

  return context;
};

export { CitiesProvider, useCities };
