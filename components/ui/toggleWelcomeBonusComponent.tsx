"use client";
import { Moon } from "lucide-react";
import { Switch } from "./switch";

const ToggleWelcomeBonusComponent = ({
  include,
  id,
  toggleBonus,
}: {
  include: boolean;
  id: string;
  toggleBonus: (formData: FormData) => void;
}) => {
  return (
    <form className="flex items-center space-x-2" action={toggleBonus}>
      <input type="hidden" value={id} name="id" />
      <div>No</div>
      <Switch
        id="airplane-mode"
        checked={include}
        name="switch"
        type="submit"
      />
      <div>Yes</div>
    </form>
  );
};

export default ToggleWelcomeBonusComponent;
