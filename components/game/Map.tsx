"use client";

import { Select, SelectItem, SelectSection } from "@heroui/react";
import { GroupedLocations } from "@/models/location";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@heroui/button";
import { ChevronRight } from "lucide-react";
import { LOCATION_ROUTE } from "@/utils/routes";

export default function Map({ locations }: { locations: GroupedLocations }) {
  const router = useRouter();
  const t = useTranslations("components.map");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const handleOnSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(event.target.value);
  };

  const handleOnPress = () => {
    router.push(LOCATION_ROUTE + "/" + selectedLocation);
  };

  return (
    <div className="flex w-1/2 items-center justify-center gap-6">
      <Select
        className="z-0 max-w-xs"
        items={locations}
        label={t("select.label")}
        placeholder={t("select.placeholder")}
        onChange={handleOnSelect}
        name="location"
        selectionMode="single"
      >
        {(group) => (
          <SelectSection
            title={group.locationGroupName}
            key={group.locationGroupId}
          >
            {group.locations.map((location) => (
              <SelectItem key={location.code} value={location.code}>
                {location.name}
              </SelectItem>
            ))}
          </SelectSection>
        )}
      </Select>
      <Button
        isIconOnly
        startContent={<ChevronRight />}
        size="sm"
        onPress={handleOnPress}
        color="primary"
        isDisabled={!selectedLocation}
      />
    </div>
  );
}
