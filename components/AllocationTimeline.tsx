"use client";

import { AgentClientAllocation } from "@/utils/types/allocation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  ArrowBigLeft,
  ArrowBigRight,
  Check,
  CirclePlus,
  Ellipsis,
  EllipsisVertical,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

import { Toaster } from "./ui/sonner";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Textarea } from "./ui/textarea";
const dayjs = require("dayjs");

export function AllocationTimeline({
  data,
  commencementMonth,
  premiumFreq,
}: {
  data: string;
  commencementMonth: string;
  premiumFreq: string;
}) {
  const currentYear = +dayjs().year();
  const [allocation, setAllocation] = useState<AgentClientAllocation>(
    JSON.parse(data)
  );
  const [editMode, setEditMode] = useState(false);
  const [displayedYear, setDisplayedYear] = useState(currentYear);
  const [openDeletePrompt, setOpenDeletePrompt] = useState(false);
  const [tempDeleteData, setTempDeleteData] =
    useState<AgentClientAllocation | null>(null);

  function addNewRow() {
    let tempAllocation: AgentClientAllocation = structuredClone(allocation);
    if (tempAllocation[displayedYear]) {
      tempAllocation[displayedYear].push({});
    } else {
      tempAllocation[displayedYear] = [];
      tempAllocation[displayedYear].push({});
    }
    setAllocation((prev) => tempAllocation);
    setEditMode(true);
  }

  function saveData(year: number, key: number, field: string, value: string) {
    let tempAllocation: AgentClientAllocation = structuredClone(allocation);
    let fund = tempAllocation[year][key];
    switch (field) {
      case "fund":
        fund.fund = value;
        break;
      case "jan":
        fund.jan = value;
        break;
      case "janPrice":
        fund.janPrice = value;
        break;
      case "feb":
        fund.feb = value;
        break;
      case "febPrice":
        fund.febPrice = value;
        break;
      case "mar":
        fund.mar = value;
        break;
      case "marPrice":
        fund.marPrice = value;
        break;
      case "apr":
        fund.apr = value;
        break;
      case "aprPrice":
        fund.aprPrice = value;
        break;
      case "may":
        fund.may = value;
        break;
      case "mayPrice":
        fund.mayPrice = value;
        break;
      case "jun":
        fund.jun = value;
        break;
      case "junPrice":
        fund.junPrice = value;
        break;
      case "jul":
        fund.jul = value;
        break;
      case "julPrice":
        fund.julPrice = value;
        break;
      case "aug":
        fund.aug = value;
        break;
      case "augPrice":
        fund.augPrice = value;
        break;
      case "sep":
        fund.sep = value;
        break;
      case "sepPrice":
        fund.sepPrice = value;
        break;
      case "oct":
        fund.oct = value;
        break;
      case "octPrice":
        fund.octPrice = value;
        break;
      case "nov":
        fund.nov = value;
        break;
      case "novPrice":
        fund.novPrice = value;
        break;
      case "dec":
        fund.dec = value;
        break;
      case "decPrice":
        fund.decPrice = value;
        break;
    }
    tempAllocation[year][key] = fund;
    setAllocation((prev) => tempAllocation);
  }

  function setTempDeleteDataFunction(year: number, key: number) {
    let tempAllocation: AgentClientAllocation = structuredClone(allocation);
    tempAllocation[year].splice(key, 1);

    setTempDeleteData(tempAllocation);
  }

  async function deleteData() {
    if (tempDeleteData) {
      setAllocation((prev) => tempDeleteData!);
    }

    await submitToServer(tempDeleteData!);
    setTempDeleteData(null);

    setOpenDeletePrompt(false);
  }

  function cancelDeleteData() {
    setTempDeleteData(null);
    setOpenDeletePrompt(false);
  }

  async function submitToServer(tempDeleteData?: AgentClientAllocation) {
    if (tempDeleteData) {
      await fetch(`${window.location.origin}/allocation`, {
        method: "POST",
        body: JSON.stringify(tempDeleteData),
      });
    } else {
      await fetch(`${window.location.origin}/allocation`, {
        method: "POST",
        body: JSON.stringify(allocation),
      });
    }
    toast("Allocation History has been saved to database.");
    setEditMode(false);
  }

  return (
    <>
      {openDeletePrompt && (
        <div className="absolute z-[100] w-screen flex justify-end">
          <Card className="w-64 mr-32 mt-16">
            <CardHeader>
              <CardTitle>Confirm Delete</CardTitle>
              <CardDescription>This action cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent className="flex space-x-2">
              <Button className="bg-red-500" onClick={deleteData}>
                Confirm
              </Button>
              <Button
                className="bg-white text-black border-black border"
                onClick={cancelDeleteData}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      <Table className="text-center">
        <TableCaption>Allocation History</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={1}>
              <ArrowBigLeft
                className="inline hover:cursor-pointer h-5 w-5"
                onClick={() => setDisplayedYear((prev) => prev - 1)}
              />
              <CirclePlus
                className="inline hover:cursor-pointer h-4 w-4"
                onClick={() => addNewRow()}
              />
              <ArrowBigRight
                className="inline hover:cursor-pointer h-5 w-5"
                onClick={() => setDisplayedYear((prev) => prev + 1)}
              />
            </TableHead>
            <TableHead className="text-center" colSpan={13}>
              Year {displayedYear}
            </TableHead>
          </TableRow>
          <TableRow>
            <TableHead className="text-center">Fund</TableHead>
            <TableHead
              className={`${
                commencementMonth === "01" && premiumFreq === "Yearly"
                  ? "bg-yellow-300"
                  : ""
              } text-center`}
            >
              Jan
            </TableHead>
            <TableHead
              className={`${
                commencementMonth === "02" && premiumFreq === "Yearly"
                  ? "bg-yellow-300"
                  : ""
              } text-center`}
            >
              Feb
            </TableHead>
            <TableHead
              className={`${
                commencementMonth === "03" && premiumFreq === "Yearly"
                  ? "bg-yellow-300"
                  : ""
              } text-center`}
            >
              Mar
            </TableHead>
            <TableHead
              className={`${
                commencementMonth === "04" && premiumFreq === "Yearly"
                  ? "bg-yellow-300"
                  : ""
              } text-center`}
            >
              Apr
            </TableHead>
            <TableHead
              className={`${
                commencementMonth === "05" && premiumFreq === "Yearly"
                  ? "bg-yellow-300"
                  : ""
              } text-center`}
            >
              May
            </TableHead>
            <TableHead
              className={`${
                commencementMonth === "06" && premiumFreq === "Yearly"
                  ? "bg-yellow-300"
                  : ""
              } text-center`}
            >
              Jun
            </TableHead>
            <TableHead
              className={`${
                commencementMonth === "07" && premiumFreq === "Yearly"
                  ? "bg-yellow-300"
                  : ""
              } text-center`}
            >
              Jul
            </TableHead>
            <TableHead
              className={`${
                commencementMonth === "08" && premiumFreq === "Yearly"
                  ? "bg-yellow-300"
                  : ""
              } text-center`}
            >
              Aug
            </TableHead>
            <TableHead
              className={`${
                commencementMonth === "09" && premiumFreq === "Yearly"
                  ? "bg-yellow-300"
                  : ""
              } text-center`}
            >
              Sep
            </TableHead>
            <TableHead
              className={`${
                commencementMonth === "10" && premiumFreq === "Yearly"
                  ? "bg-yellow-300"
                  : ""
              } text-center`}
            >
              Oct
            </TableHead>
            <TableHead
              className={`${
                commencementMonth === "11" && premiumFreq === "Yearly"
                  ? "bg-yellow-300"
                  : ""
              } text-center`}
            >
              Nov
            </TableHead>
            <TableHead
              className={`${
                commencementMonth === "12" && premiumFreq === "Yearly"
                  ? "bg-yellow-300"
                  : ""
              } text-center`}
            >
              Dec
            </TableHead>
            <TableHead className="text-center"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allocation[displayedYear]?.map((fund, key) => (
            <TableRow key={key}>
              <TableCell className="w-[150px] p-0 m-0">
                {editMode ? (
                  <Textarea
                    value={fund.fund || ""}
                    onChange={(e) => {
                      saveData(displayedYear, key, "fund", e.target.value);
                    }}
                  />
                ) : (
                  fund.fund
                )}
              </TableCell>
              <TableCell className="p-0">
                <Table>
                  <TableBody>
                    <TableRow className="border-none">
                      <TableCell className="p-0">
                        {editMode ? (
                          <Textarea
                            value={fund.jan || ""}
                            onChange={(e) => {
                              saveData(
                                displayedYear,
                                key,
                                "jan",
                                e.target.value
                              );
                            }}
                          />
                        ) : (
                          fund.jan
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-none">
                      <TableCell className="p-0 text-xs">
                        {editMode ? (
                          <Textarea
                            value={fund.janPrice || ""}
                            onChange={(e) => {
                              saveData(
                                displayedYear,
                                key,
                                "janPrice",
                                e.target.value
                              );
                            }}
                          />
                        ) : (
                          fund.janPrice
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableCell>
              <TableCell className="p-0">
                <Table>
                  <TableBody>
                    <TableRow className="border-none">
                      <TableCell className="p-0">
                        {editMode ? (
                          <Textarea
                            value={fund.feb || ""}
                            onChange={(e) => {
                              saveData(
                                displayedYear,
                                key,
                                "feb",
                                e.target.value
                              );
                            }}
                          />
                        ) : (
                          fund.feb
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-none">
                      <TableCell className="p-0 text-xs">
                        {editMode ? (
                          <Textarea
                            value={fund.febPrice || ""}
                            onChange={(e) => {
                              saveData(
                                displayedYear,
                                key,
                                "febPrice",
                                e.target.value
                              );
                            }}
                          />
                        ) : (
                          fund.febPrice
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableCell>
              <TableCell className="p-0">
                <Table>
                  <TableBody>
                    <TableRow className="border-none">
                      <TableCell className="p-0">
                        {editMode ? (
                          <Textarea
                            value={fund.mar || ""}
                            onChange={(e) => {
                              saveData(
                                displayedYear,
                                key,
                                "mar",
                                e.target.value
                              );
                            }}
                          />
                        ) : (
                          fund.mar
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-none">
                      <TableCell className="p-0 text-xs">
                        {editMode ? (
                          <Textarea
                            value={fund.marPrice || ""}
                            onChange={(e) => {
                              saveData(
                                displayedYear,
                                key,
                                "marPrice",
                                e.target.value
                              );
                            }}
                          />
                        ) : (
                          fund.marPrice
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableCell>
              <TableCell className="p-0">
                <Table>
                  <TableBody>
                    <TableRow className="border-none">
                      <TableCell className="p-0">
                        {editMode ? (
                          <Textarea
                            value={fund.apr || ""}
                            onChange={(e) => {
                              saveData(
                                displayedYear,
                                key,
                                "apr",
                                e.target.value
                              );
                            }}
                          />
                        ) : (
                          fund.apr
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-none">
                      <TableCell className="p-0 text-xs">
                        {editMode ? (
                          <Textarea
                            value={fund.aprPrice || ""}
                            onChange={(e) => {
                              saveData(
                                displayedYear,
                                key,
                                "aprPrice",
                                e.target.value
                              );
                            }}
                          />
                        ) : (
                          fund.aprPrice
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableCell>
              <TableCell className="p-0">
                <Table>
                  <TableBody>
                    <TableRow className="border-none">
                      <TableCell className="p-0">
                        {editMode ? (
                          <Textarea
                            value={fund.may || ""}
                            onChange={(e) => {
                              saveData(
                                displayedYear,
                                key,
                                "may",
                                e.target.value
                              );
                            }}
                          />
                        ) : (
                          fund.may
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-none">
                      <TableCell className="p-0 text-xs">
                        {editMode ? (
                          <Textarea
                            value={fund.mayPrice || ""}
                            onChange={(e) => {
                              saveData(
                                displayedYear,
                                key,
                                "mayPrice",
                                e.target.value
                              );
                            }}
                          />
                        ) : (
                          fund.mayPrice
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableCell>
              <TableCell className="p-0">
                <Table>
                  <TableBody>
                    <TableRow className="border-none">
                      <TableCell className="p-0">
                        {editMode ? (
                          <Textarea
                            value={fund.jun || ""}
                            onChange={(e) => {
                              saveData(
                                displayedYear,
                                key,
                                "jun",
                                e.target.value
                              );
                            }}
                          />
                        ) : (
                          fund.jun
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-none">
                      <TableCell className="p-0 text-xs">
                        {editMode ? (
                          <Textarea
                            value={fund.junPrice || ""}
                            onChange={(e) => {
                              saveData(
                                displayedYear,
                                key,
                                "junPrice",
                                e.target.value
                              );
                            }}
                          />
                        ) : (
                          fund.junPrice
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableCell>
              <TableCell className="p-0">
                <Table>
                  <TableBody>
                    <TableRow className="border-none">
                      <TableCell className="p-0">
                        {editMode ? (
                          <Textarea
                            value={fund.jul || ""}
                            onChange={(e) => {
                              saveData(
                                displayedYear,
                                key,
                                "jul",
                                e.target.value
                              );
                            }}
                          />
                        ) : (
                          fund.jul
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-none">
                      <TableCell className="p-0 text-xs">
                        {editMode ? (
                          <Textarea
                            value={fund.julPrice || ""}
                            onChange={(e) => {
                              saveData(
                                displayedYear,
                                key,
                                "julPrice",
                                e.target.value
                              );
                            }}
                          />
                        ) : (
                          fund.julPrice
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableCell>
              <TableCell className="p-0">
                <Table>
                  <TableBody>
                    <TableRow className="border-none">
                      <TableCell className="p-0">
                        {editMode ? (
                          <Textarea
                            value={fund.aug || ""}
                            onChange={(e) => {
                              saveData(
                                displayedYear,
                                key,
                                "aug",
                                e.target.value
                              );
                            }}
                          />
                        ) : (
                          fund.aug
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-none">
                      <TableCell className="p-0 text-xs">
                        {editMode ? (
                          <Textarea
                            value={fund.augPrice || ""}
                            onChange={(e) => {
                              saveData(
                                displayedYear,
                                key,
                                "augPrice",
                                e.target.value
                              );
                            }}
                          />
                        ) : (
                          fund.augPrice
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableCell>
              <TableCell className="p-0">
                <Table>
                  <TableBody>
                    <TableRow className="border-none">
                      <TableCell className="p-0">
                        {editMode ? (
                          <Textarea
                            value={fund.sep || ""}
                            onChange={(e) => {
                              saveData(
                                displayedYear,
                                key,
                                "sep",
                                e.target.value
                              );
                            }}
                          />
                        ) : (
                          fund.sep
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-none">
                      <TableCell className="p-0 text-xs">
                        {editMode ? (
                          <Textarea
                            value={fund.sepPrice || ""}
                            onChange={(e) => {
                              saveData(
                                displayedYear,
                                key,
                                "sepPrice",
                                e.target.value
                              );
                            }}
                          />
                        ) : (
                          fund.sepPrice
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableCell>
              <TableCell className="p-0">
                <Table>
                  <TableBody>
                    <TableRow className="border-none">
                      <TableCell className="p-0">
                        {editMode ? (
                          <Textarea
                            value={fund.oct || ""}
                            onChange={(e) => {
                              saveData(
                                displayedYear,
                                key,
                                "oct",
                                e.target.value
                              );
                            }}
                          />
                        ) : (
                          fund.oct
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-none">
                      <TableCell className="p-0 text-xs">
                        {editMode ? (
                          <Textarea
                            value={fund.octPrice || ""}
                            onChange={(e) => {
                              saveData(
                                displayedYear,
                                key,
                                "octPrice",
                                e.target.value
                              );
                            }}
                          />
                        ) : (
                          fund.octPrice
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableCell>
              <TableCell className="p-0">
                <Table>
                  <TableBody>
                    <TableRow className="border-none">
                      <TableCell className="p-0">
                        {editMode ? (
                          <Textarea
                            value={fund.nov || ""}
                            onChange={(e) => {
                              saveData(
                                displayedYear,
                                key,
                                "nov",
                                e.target.value
                              );
                            }}
                          />
                        ) : (
                          fund.nov
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-none">
                      <TableCell className="p-0 text-xs">
                        {editMode ? (
                          <Textarea
                            value={fund.novPrice || ""}
                            onChange={(e) => {
                              saveData(
                                displayedYear,
                                key,
                                "novPrice",
                                e.target.value
                              );
                            }}
                          />
                        ) : (
                          fund.novPrice
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableCell>
              <TableCell className="p-0">
                <Table>
                  <TableBody>
                    <TableRow className="border-none">
                      <TableCell className="p-0">
                        {editMode ? (
                          <Textarea
                            value={fund.dec || ""}
                            onChange={(e) => {
                              saveData(
                                displayedYear,
                                key,
                                "dec",
                                e.target.value
                              );
                            }}
                          />
                        ) : (
                          fund.dec
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-none">
                      <TableCell className="p-0 text-xs">
                        {editMode ? (
                          <Textarea
                            value={fund.decPrice || ""}
                            onChange={(e) => {
                              saveData(
                                displayedYear,
                                key,
                                "decPrice",
                                e.target.value
                              );
                            }}
                          />
                        ) : (
                          fund.decPrice
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableCell>
              <TableCell className="text-right">
                {!editMode && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <Ellipsis className="h-4 w-4 inline cursor-pointer" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setEditMode(true)}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => {
                          setOpenDeletePrompt(true);
                          setTempDeleteDataFunction(displayedYear, key);
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {editMode && (
                  <Check
                    className="h-4 w-4 inline cursor-pointer"
                    onClick={() => {
                      submitToServer();
                    }}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
