import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { getPrices } from "../prices/action";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
  PromiseLikeOfReactNode,
} from "react";

const page = async () => {
  const prices = await getPrices();
  console.log(prices);
  return (
    <section className="grid grid-cols-3 gap-4 mx-10">
      <Card className="flex flex-col">
        <CardHeader>List of Funds (Scrollable)</CardHeader>
        <ScrollArea className="max-h-[600px]">
          <Table>
            <TableBody>
              {prices.funds.map(
                (price: {
                  fundName:
                    | string
                    | number
                    | boolean
                    | ReactElement<any, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | PromiseLikeOfReactNode
                    | null
                    | undefined;
                }) => (
                  <TableRow>
                    <TableCell>{price.fundName}</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
      <Card className="flex flex-col col-span-2">
        <CardHeader className="items-center pb-0">
          <CardDescription className="text-md">
            Work in Progress
          </CardDescription>
        </CardHeader>
      </Card>
    </section>
  );
};

export default page;
