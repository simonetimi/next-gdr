"use client";

import { Location } from "@/models/location";

export default function LocationChatSidebar({
  location,
}: {
  location: Location;
}) {
  return (
    <aside className="hidden w-[320px] flex-col gap-8 p-6 md:flex">
      <h1>{location.name}</h1>
      <p>{location.description}</p>
      Weather, chat description, location image
    </aside>
  );
}
