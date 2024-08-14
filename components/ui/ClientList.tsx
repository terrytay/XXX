"use client";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./table";
import Link from "next/link";

import {
  AppWindowMac,
  ArrowUpDown,
  CircleMinus,
  CirclePlus,
  LucideLink,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { Button } from "./button";
import { useState } from "react";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

import { deleteClient, newClient, updateClient } from "@/app/clients/action";
import {} from "@radix-ui/react-dialog";
import {
  DialogFooter,
  DialogHeader,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { FpmsData, PolicyFund } from "@/utils/types/fpms";
import { format2dp, formatUnits } from "@/utils/formatters";
import { useRouter } from "next/navigation";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

export type Client = {
  id: string;
  agent_id: string;
  created_at: string;
  nickname: string;
  policy_number: string;
  policy_link: string;
  commencementDate: string;
  premium: string;
  tiv: string;
  tia: number;
  grossProfit: string;
  productName: string;
  dividendsPaidout: number;
  cash?: number;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  aggregatedData: {
    totalAum: number;
    totalPremium: number;
    totalRoi: string;
  };
}

export const columns: ColumnDef<Client>[] = [
  {
    accessorKey: "policy_number",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Policy Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div>
          <Link href={`portfolio/${row.getValue("policy_number")}`}>
            {row.getValue("policy_number")}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "nickname",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nickname
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const [hide, setHide] = useState(true);
      return (
        <div
          className="cursor-pointer"
          onMouseEnter={() => setHide(false)}
          onMouseLeave={() => setHide(true)}
        >
          {!row.getIsSelected() ? (
            <div>{hide ? "********" : row.getValue("nickname")}</div>
          ) : (
            <div>{row.getValue("nickname")}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "productName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div>{row.getValue("productName")}</div>;
    },
  },
  {
    sortingFn: "datetime",
    accessorKey: "commencementDate",
    header: ({ column }) => {
      return <div>Commencement Date</div>;
    },
    cell: ({ row }) => {
      return <div>{row.getValue("commencementDate")}</div>;
    },
  },
  {
    accessorKey: "premium",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Premium
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div>{row.getValue("premium")}</div>;
    },
  },
  {
    accessorKey: "tia",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Invested
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div>{format2dp(row.getValue("tia"))}</div>;
    },
  },

  {
    accessorKey: "tiv",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          AUM
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div>{format2dp(row.getValue("tiv"))}</div>;
    },
  },
  {
    accessorKey: "cash",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cash Reserve
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name: string = row.getValue('nickname')

      return <div>{format2dp(row.getValue("cash"))}</div>;
    },
  },
  {
    accessorKey: "dividendsPaidout",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Dividends Paid
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div>{format2dp(row.getValue("dividendsPaidout"))}</div>;
    },
  },
  {
    accessorKey: "grossProfit",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ROI (%)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div
          className={`${
            +row.getValue<string>("grossProfit").split("%")[0] > 0
              ? "text-green-500"
              : "text-red-500"
          }`}
        >
          {row.getValue<string>("grossProfit").split("%")[0]}
        </div>
      );
    },
  },
  // {
  //   accessorKey: "policy_link",
  //   header: "Link",
  //   cell: ({ row }) => {
  //     const link: string = row.getValue("policy_link");
  //     return (
  //       <div className="flex flex-col space-y-2 w-[200px]">
  //         {link.split(" ").map((link: string) => (
  //           <Link href={link} key={link} className="truncate">
  //             {link}
  //           </Link>
  //         ))}
  //       </div>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "created_at",
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant="ghost"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //       >
  //         Created At
  //         <ArrowUpDown className="ml-2 h-4 w-4" />
  //       </Button>
  //     );
  //   },
  //   cell: ({ row }) => {
  //     return <div>{row.getValue("created_at")}</div>;
  //   },
  // },
  {
    id: "actions",
    cell: ({ row }) => {
      const [modifyAction, setModifyAction] = useState("");
      const { nickname, policy_number, policy_link } = row.original;
      const router = useRouter();

      const formSchema = z.object({
        nickname: z.string(),
        policy_number: z.string(),
        policy_link: z.string(),
      });

      const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          nickname: row.original.nickname,
          policy_number: row.original.policy_number,
          policy_link: row.original.policy_link,
        },
      });

      async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.

        await updateClient({ ...values, id: row.original.id });
        router.refresh();
      }

      return (
        <div className="flex justify-end space-x-2 print:hidden">
          {policy_link.split(" ").map((link, key) => (
            <div
              onClick={() => window.open(link)}
              key={key}
              className="cursor-pointer"
            >
              <LucideLink className="text-gray-500" size={18} />
            </div>
          ))}
          <Dialog>
            <DialogTrigger>
              <Pencil className="text-gray-500" size={18} />
            </DialogTrigger>
            <DialogContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <DialogHeader>
                    <DialogTitle>Edit</DialogTitle>
                    <DialogDescription>Modify client details</DialogDescription>

                    <FormField
                      control={form.control}
                      name="policy_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Policy Number</FormLabel>
                          <FormControl>
                            <Input placeholder="shadcn" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nickname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nickname</FormLabel>
                          <FormControl>
                            <Input placeholder="shadcn" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="policy_link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Link</FormLabel>
                          <FormControl>
                            <Input placeholder="shadcn" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="submit">Confirm</Button>
                    </DialogClose>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger>
              <CircleMinus className="text-gray-500" size={18} />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. Are you sure you want to
                  permanently delete this file from our servers?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    onClick={async () => {
                      await deleteClient(policy_number);
                    }}
                  >
                    Confirm
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
];

export default function DataTable<TData, TValue>({
  columns,
  data,
  aggregatedData,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "grossProfit", desc: true },
  ]);

  const router = useRouter();

  async function popPages() {
    const pages = data as Client[];
    pages.forEach((page) => {
      const policylinks = page.policy_link.split(" ");
      policylinks.forEach((link) => {
        window.open(link);
      });
    });
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const formSchema = z.object({
    nickname: z.string(),
    policy_number: z.string(),
    policy_link: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: "",
      policy_number: "",
      policy_link: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    await newClient(values);
    router.refresh();
  }

  return (
    <div className="rounded-md border w-screen md:w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div className="flex items-center py-4 pl-4 space-x-2">
          <Input
            placeholder="Filter by number..."
            value={
              (table.getColumn("policy_number")?.getFilterValue() as string) ??
              ""
            }
            onChange={(event) =>
              table
                .getColumn("policy_number")
                ?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Input
            placeholder="Filter by nickname..."
            value={
              (table.getColumn("nickname")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("nickname")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Button
            onClick={() => table.toggleAllPageRowsSelected()}
            className="print:hidden"
          >
            {table.getIsAllPageRowsSelected() ? "Hide" : "Show"} all Nickname
          </Button>
        </div>
        <div className="py-4 pr-4 flex justify-between grow">
          <div className="flex pl-8 space-x-6">
            <span>
              Total Invested:&nbsp;
              <span className="text-sm md:text-lg">
                {format2dp(aggregatedData.totalPremium)}
              </span>
            </span>

            <span>
              AUM:&nbsp;
              <span className="text-sm md:text-lg">
                {format2dp(aggregatedData.totalAum)}
              </span>
            </span>
            <span>
              ROI:&nbsp;
              <span className="text-sm md:text-lg">
                {aggregatedData.totalRoi}
              </span>
            </span>
          </div>
          <div className="flex justify-center items-center space-x-2">
            <HoverCard>
              <HoverCardTrigger>
                <AppWindowMac
                  className="text-gray-500 cursor-pointer"
                  size={18}
                  onClick={() => popPages()}
                />
              </HoverCardTrigger>
              <HoverCardContent>
                Opens all FPMS pages at once. Note: Please login to FPMS
                beforehand.
              </HoverCardContent>
            </HoverCard>

            <Dialog>
              <DialogTrigger>
                <CirclePlus className="text-gray-500" size={18} />
              </DialogTrigger>
              <DialogContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    <DialogHeader>
                      <DialogTitle>Add New Client</DialogTitle>
                      <DialogDescription>
                        Fill in client details
                      </DialogDescription>

                      <FormField
                        control={form.control}
                        name="policy_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Policy Number</FormLabel>
                            <FormControl>
                              <Input placeholder="01234567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="nickname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nickname</FormLabel>
                            <FormControl>
                              <Input placeholder="Pupu Tay" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="policy_link"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Link</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://fpms.greateasternlife.com/...."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="submit">Confirm</Button>
                      </DialogClose>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      <div>
        <Table className="text-xs md:text-sm">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="px-0">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {/* <div className="flex items-center justify-end space-x-2 py-4 pr-4 z-[100]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div> */}
      </div>
    </div>
  );
}
