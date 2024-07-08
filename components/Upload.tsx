"use client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { JSX, SVGProps, useRef, useState } from "react";
import { CircleMinus, Terminal } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

export default function UploadComponent() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState<boolean>(false);
  const inputRef = useRef<any>(null);
  const [files, setFiles] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const searchParams = useSearchParams();

  const message = searchParams.get("message");

  const uploadFiles = async (files: File[]) => {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (files.length === 0) {
      router.push("/upload?message=Please select a file");
    } else {
      if (user) {
        const { data, error } = await supabase.storage
          .from("policies")
          .upload(user.id, files[0], {
            contentType: "json",
            upsert: true,
          });
        if (error) {
          router.push("/upload?message=Could not upload file");
        }
      }
      setSuccess(true);
      router.push("/protected");
    }
    setLoading(false);
  };

  function handleChange(e: any) {
    e.preventDefault();
    console.log("has changed");
    if (e.target.files && e.target.files[0]) {
      for (let i = 0; i < e.target.files["length"]; i++) {
        setFiles((prevState: any) => [...prevState, e.target.files[i]]);
      }
      console.log("From Dialog: File has been added");
    }
  }
  function handleDrop(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      for (let i = 0; i < e.dataTransfer.files["length"]; i++) {
        setFiles((prevState: any) => [...prevState, e.dataTransfer.files[i]]);
      }
      console.log("From Drag: File has been added");
    }
  }

  function handleDragLeave(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function handleDragOver(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragEnter(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function removeFile(fileName: any, idx: any) {
    const newArr = [...files];
    newArr.splice(idx, 1);
    setFiles([]);
    setFiles(newArr);
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <Label
          htmlFor="file"
          className="text-sm font-medium"
          hidden={files.length}
        >
          <div
            className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col gap-1 p-6 items-center"
            onDragEnter={handleDragEnter}
            onSubmit={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
          >
            <FileIcon className="w-12 h-12" />
            <span className="text-sm font-medium text-gray-500">
              Drag and drop a file or click to browse
            </span>
            <span className="text-xs text-gray-500">
              PDF, image, video, or audio
            </span>
          </div>
          <Input
            id="file"
            type="file"
            placeholder="File"
            accept="*.json"
            ref={inputRef}
            onChange={handleChange}
            className="hidden"
          />
        </Label>
        <div
          className={`${
            files.length ? "" : "hidden"
          } border-2 border-dashed border-gray-200 rounded-lg flex gap-1 p-6 items-center justify-between text-sm font-medium`}
        >
          <div>{files[0]?.name}</div>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => setFiles((prev: any) => [])}
          >
            <CircleMinus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start -mt-2 space-y-2 text-red-500 text-sm">
        <div>{message}</div>
        <Button size="lg" onClick={() => uploadFiles(files)} disabled={loading}>
          Upload
        </Button>
      </CardFooter>
      <Alert
        className="absolute top-0 left-0 max-w-2xl transition"
        hidden={!success}
      >
        <Terminal className="h-4 w-4" />
        <AlertTitle>Success!</AlertTitle>
        <AlertDescription>
          Your list of policies have been added to the database.
        </AlertDescription>
      </Alert>
    </Card>
  );
}

function FileIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}
