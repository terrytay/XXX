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
            2. Unzip and edit&nbsp;
            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
              background.js
            </code>
            : replace&nbsp;
            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
              agentId
            </code>
            &nbsp;with&nbsp;
            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
              {params.agentId}
            </code>
            &nbsp;inside the quotation marks. TAKE NOTE THERE ARE TWO OCCURENCES
            IN THIS FILE. SO DO TWO TIMES.
          </p>
          <Image
            className="pb-2"
            src="/extensionss.png"
            width={500}
            height={500}
            alt="extension"
          />
          <p>
            <span>3. Open Google Chrome Extension</span>
            <Image
              className="py-2"
              src="/chrome.png"
              width={500}
              height={500}
              alt="chrome"
            />
            <span>
              4. Click on button 'Load Unpacked' and select the extension
              folder.
            </span>
          </p>
          <p>
            5. Go to FPMS benefits page of client and click on the&nbsp;
            <Image
              src="/copy.png"
              width={40}
              height={40}
              alt="copy"
              className="inline"
            />
            &nbsp; icon TWICE. (You can also to the ILP dividend page and do the
            same thing.)
            <Image
              src="/fpms.png"
              width={800}
              height={800}
              alt="fpms"
              className="py-2"
            />
          </p>
          <p>
            <span>
              6. Copy the URL of this page and go to the homepage of this
              application to fill in client details.
            </span>
            <Image
              className="py-2"
              src="/clientpage.png"
              width={600}
              height={600}
              alt="clientpage"
            />
          </p>
          <p>
            7. Voila! Now on the clients page, you can click on the policy
            number to go the management page.
          </p>
        </CardContent>
        {/* <CardFooter>
          <p>Card Footer</p>
        </CardFooter> */}
      </Card>
    </section>
  );
}
