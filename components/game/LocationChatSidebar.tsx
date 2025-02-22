"use client";

import { Location } from "@/models/location";
import { WeatherForecasts } from "@/models/weather";
import Weather from "@/components/ui/Weather";

export default function LocationChatSidebar({
  location,
  weather,
}: {
  location: Location;
  weather: WeatherForecasts;
}) {
  return (
    <aside className="hidden w-[320px] flex-col gap-8 p-6 md:flex">
      <h1>{location.name}</h1>
      {location.imageUrl && (
        <img
          src={location.imageUrl}
          alt={location.name}
          className="h-10 w-10 rounded-2xl"
        />
      )}
      <p>{location.description}</p>
      <Weather weather={weather} />
      Weather, chat description, location image (two lines, find icons, make
      labels in the dictionary and map everything in an object we can import)
    </aside>
  );
}
