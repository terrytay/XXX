"use client";
import { Moon } from "lucide-react";
import { Switch } from "./switch";

const ToggleThemeComponent = ({
  dark,
  id,
  toggleTheme,
}: {
  dark: boolean;
  id: string;
  toggleTheme: (formData: FormData) => void;
}) => {
  return (
    <form className="flex items-center space-x-2" action={toggleTheme}>
      <input type="hidden" value={id} name="id" />
      <Switch id="airplane-mode" checked={dark} name="switch" type="submit" />
      <Moon size={"1rem"} />
    </form>
  );
};

export default ToggleThemeComponent;
