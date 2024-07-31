"use client";
import { Moon } from "lucide-react";
import { Switch } from "./switch";

const ToggleAdminViewComponent = ({
  adminView,
  id,
  toggleAdminView,
}: {
  adminView: boolean;
  id: string;
  toggleAdminView: (formData: FormData) => void;
}) => {
  return (
    <form className="flex items-center space-x-2" action={toggleAdminView}>
      <input type="hidden" value={id} name="id" />
      <div>No</div>
      <Switch
        id="airplane-mode"
        checked={adminView}
        name="switch"
        type="submit"
      />
      <div>Yes</div>
    </form>
  );
};

export default ToggleAdminViewComponent;
