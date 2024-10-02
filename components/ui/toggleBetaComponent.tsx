"use client";
import { Moon } from "lucide-react";
import { Switch } from "./switch";

const ToggleWelcomeBonusComponent = ({
  beta,
  id,
  toggleBeta,
}: {
  beta: boolean;
  id: string;
  toggleBeta: (formData: FormData) => void;
}) => {
  return (
    <form className="flex items-center space-x-2" action={toggleBeta}>
      <input type="hidden" value={id} name="id" />
      <div>No</div>
      <Switch id="airplane-mode" checked={beta} name="switch" type="submit" />
      <div>Yes</div>
    </form>
  );
};

export default ToggleWelcomeBonusComponent;
