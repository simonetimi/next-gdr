"use client";

import { Button } from "@heroui/button";
import { Github } from "lucide-react";
import { useState } from "react";
import { login } from "@/server/actions/auth";

// TODO replace lucide github icon with svg

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState("");

  return (
    <form
      onSubmit={async () => {
        setIsLoading(true);
        await login(provider);
      }}
    >
      <Button
        isLoading={isLoading}
        type="submit"
        color="primary"
        startContent={!isLoading && <Github />}
        onPress={() => setProvider("github")}
      >
        Login with GitHub
      </Button>
    </form>
  );
}
