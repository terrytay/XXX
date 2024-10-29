"use client";
import React, { useEffect, useState } from "react";
import { Card } from "./card";
import { AllocationTimeline } from "../AllocationTimeline";
import { AllocationTimelineBeta } from "../AllocationTimelineBeta";
import { AgentClientAllocation } from "@/utils/types/allocation";
import { FpmsData } from "@/utils/types/fpms";
import { FundSwitch } from "../../utils/transactionsParser";
import { Switch } from "./switch";
import { Label } from "./label";

const AllocationWrapper = ({
  allocationDataJSON,
  templateAllocationDataJSON,
  dataJSON,
  fundswitchesJSON,
  dailyPricesJSON,
}: {
  allocationDataJSON: string;
  templateAllocationDataJSON: string;
  dataJSON: string;
  fundswitchesJSON: string;
  dailyPricesJSON: string;
}) => {
  let localStorageValue = true;
  const [toggleView, setToggleView] = useState<boolean | null>(null);

  useEffect(() => {
    localStorageValue = localStorage.getItem("view") === "true" || false;
    setToggleView(localStorageValue);
  }, []);

  const saveToLocalStorage = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    localStorage.setItem("view", toggleView!.toString());
  };

  const allocationData = JSON.parse(allocationDataJSON);
  const templateAllocationData = JSON.parse(templateAllocationDataJSON);
  const fundswitches = JSON.parse(fundswitchesJSON);
  const data = JSON.parse(dataJSON);
  const dailyPrices = JSON.parse(dailyPricesJSON);
  return (
    <Card className="py-2 col-span-3">
      {toggleView != null && (
        <>
          <form
            className="flex justify-center items-center gap-x-2 pb-2"
            onChange={saveToLocalStorage}
          >
            <Label className="font-normal">Manual</Label>
            <Switch
              checked={toggleView}
              onCheckedChange={() => setToggleView(!toggleView)}
            />
            <Label className="font-normal">Auto</Label>
          </form>
          {toggleView ? (
            <AllocationTimelineBeta
              data={JSON.stringify(fundswitches)}
              commencementMonth={data!.profile.commencementDate.split("/")[1]}
              premiumFreq={data!.profile.premiumFreq}
              dailyPricesJSON={JSON.stringify(dailyPrices)}
            />
          ) : (
            <AllocationTimeline
              data={JSON.stringify(allocationData || templateAllocationData)}
              commencementMonth={data!.profile.commencementDate.split("/")[1]}
              premiumFreq={data!.profile.premiumFreq}
            />
          )}
        </>
      )}
    </Card>
  );
};

export default AllocationWrapper;
