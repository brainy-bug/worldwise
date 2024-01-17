import { useSearchParams } from "react-router-dom";

const useURLPosition = () => {
  const [searchParams] = useSearchParams();

  const mapLat = searchParams.get("lat");
  const mapLng = searchParams.get("lng");

  return { mapLat, mapLng };
};

export default useURLPosition;
