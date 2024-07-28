import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

export default async function Page({
  params,
}: {
  params: { agentId: string };
}) {
  return (
    <section className="flex flex-col gap-4 mx-20">
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            How to configure to get data displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            1. Click&nbsp;
            <Link
              className="text-blue-500"
              href="https://fzqltlsfconsjwlyooio.supabase.co/storage/v1/object/public/downloads/extension.zip"
            >
              here
            </Link>
            &nbsp;to download the Chrome extension.
          </p>
          <p>
            2. Agent ID:&nbsp;
            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
              {params.agentId}
            </code>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
