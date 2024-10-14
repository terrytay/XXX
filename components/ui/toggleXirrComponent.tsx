"use client";
import { Moon } from "lucide-react";
import { Switch } from "./switch";

const ToggleXirrComponent = ({
  xirr,
  id,
  toggleXirr,
}: {
  xirr: boolean;
  id: string;
  toggleXirr: (formData: FormData) => void;
}) => {
  return (
    <form className="flex items-center space-x-2" action={toggleXirr}>
      <input type="hidden" value={id} name="id" />
      <div>No</div>
      <Switch id="airplane-mode" checked={xirr} name="switch" type="submit" />
      <div>Yes</div>
    </form>
  );
};

export default ToggleXirrComponent;
