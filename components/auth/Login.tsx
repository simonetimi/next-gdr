"use client";

import { Button } from "@heroui/button";
import { useState } from "react";
import Github from "@/components/ui/icons/logos/Github";
import { login } from "@/server/actions/auth";

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
        startContent={!isLoading && <Github className="h-5 w-5 fill-white" />}
        onPress={() => setProvider("github")}
      >
        Login with GitHub
      </Button>
    </form>
  );
}
