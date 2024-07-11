"use client";
import { Progress } from "@/components/ui/progress";
import React from "react";

export default function Loading() {
  const [progress, setProgress] = React.useState(13);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full min-h-full flex items-center justify-center">
      <Progress value={progress} className="w-[60%]" />
    </div>
  );
}
