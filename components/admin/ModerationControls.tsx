"use client";

import { Tab, Tabs } from "@heroui/tabs";

export default function ModerationControls() {
  return (
    <section className="my-4 flex flex-1 flex-col justify-self-start">
      <Tabs
        aria-label="Moderation settings"
        className="max-w-3/4 flex items-center justify-center"
      >
        <Tab
          key="moderation"
          title="Moderation"
          className="flex justify-center"
        >
          <div className="w-3/4">
            Qui ci sta roba Qui ci sta roba Qui ci sta roba Qui ci sta roba Qui
            ci sta roba Qui ci sta roba Qui ci sta roba Qui ci sta roba Qui ci
            sta roba Qui ci sta roba i ci sta roba Qui ci sta roba Qui ci sta
            roba Qui ci sta roba Qui ci sta robai ci sta roba Qui ci sta roba
            Qui ci sta roba Qui ci sta roba Qui ci sta robai ci sta roba Qui ci
            sta roba Qui ci sta roba Qui ci sta roba Qui ci sta robai ci sta
            roba Qui ci sta roba Qui ci sta roba Qui ci sta roba Qui ci sta
            robai ci sta roba Qui ci sta roba Qui ci sta roba Qui ci sta roba
            Qui ci sta robai ci sta roba Qui ci sta roba Qui ci sta roba Qui ci
            sta roba Qui ci sta robai ci sta roba Qui ci sta roba Qui ci sta
            roba Qui ci sta roba Qui ci sta roba
          </div>
        </Tab>
        <Tab
          key="characters"
          title="Characters"
          className="flex justify-center"
        >
          Qui ci sta roba
        </Tab>
        <Tab key="messaggi" title="Messaggi" className="flex justify-center">
          Qui ci sta roba
        </Tab>
        <Tab key="test" title="Test" className="flex justify-center">
          Qui ci sta roba
        </Tab>
      </Tabs>
    </section>
  );
}
