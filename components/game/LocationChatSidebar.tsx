import { Location } from "@/models/location";
import { WeatherForecasts } from "@/models/weather";
import Weather from "@/components/ui/Weather";
import { temperatureToColor } from "@/utils/weather";

export default function LocationChatSidebar({
  location,
  weather,
}: {
  location: Location;
  weather: WeatherForecasts;
}) {
  const temperatureColor = temperatureToColor(weather.temperature);

  return (
    <aside className="hidden w-[320px] flex-col items-center gap-6 p-6 md:flex">
      <Weather weather={weather} temperatureColor={temperatureColor} />
      <h1>{location.name}</h1>
      {location.imageUrl && (
        <img
          src={location.imageUrl}
          alt={location.name}
          className="h-[150px] w-[150px] rounded-2xl"
        />
      )}
      <p>{location.description}</p>
    </aside>
  );
}
