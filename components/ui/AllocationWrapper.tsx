"use client";
import React, { useState } from "react";
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
  const [toggleView, setToggleView] = useState(true);
  const allocationData = JSON.parse(allocationDataJSON);
  const templateAllocationData = JSON.parse(templateAllocationDataJSON);
  const fundswitches = JSON.parse(fundswitchesJSON);
  const data = JSON.parse(dataJSON);
  const dailyPrices = JSON.parse(dailyPricesJSON);
  return (
    <Card className="py-2 col-span-3">
      <div className="flex justify-center items-center gap-x-2 pb-2">
        <Label className="font-normal">Manual</Label>
        <Switch
          checked={toggleView}
          onCheckedChange={() => setToggleView(!toggleView)}
        />
        <Label className="font-normal">Auto</Label>
      </div>
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
    </Card>
  );
};

export default AllocationWrapper;
