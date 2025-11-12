"use client";
import * as React from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clients } from "./clients";
import { Checkbox } from "@/components/ui/checkbox";

type CostCardProps = {
  item: Clients | null;
  setModalInfo: any;
};

export function Client_Card({ ...props }: CostCardProps) {
  const [inputsData, setInputsData] = React.useState(
    props.item ?? {
      createdBy: "",
      createdDate: "",
      deletedBy: null,
      deletedDate: null,
      email: "",
      isActive: true,
      isDeleted: false,
      maxRequests: 0,
      modifiedBy: null,
      modifiedDate: null,
      name: "",
      phone_number: "",
      status: "Active",
      timeWindow: 0,
      timezone: "",
      timezoneOffset: 0,
    }
  );

  console.log(props.item);
  const handleCheck = (value: "Active" | "Inactive") => {
    setInputsData((prev) => ({
      ...prev,
      status: value,
    }));
  };

  console.log(inputsData);
  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/15">
      <Card className="w-[423px]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {props.item == null ? "New" : "Edit"} Client
            <X
              className="w-4 h-4 text-[#71717a] cursor-pointer"
              onClick={() => {
                props.setModalInfo({
                  isOpen: false,
                  item: null,
                });
              }}
            />
          </CardTitle>
          <CardDescription>
            Fill in the details below to{" "}
            {props.item == null ? "register a new" : "edit a"} client.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Client Name</Label>
                <Input
                  id="name"
                  placeholder="Client name..."
                  value={inputsData.name}
                  onChange={(e) =>
                    setInputsData((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        name: e.target.value,
                      };
                    })
                  }
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="Enter your email......"
                  value={inputsData.email}
                  onChange={(e) =>
                    setInputsData((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        email: e.target.value,
                      };
                    })
                  }
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  placeholder="Enter phone number..."
                  value={inputsData.phone_number}
                  onChange={(e) =>
                    setInputsData((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        phone_number: e.target.value,
                      };
                    })
                  }
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="timezone">Timezone Offset</Label>
                <Input
                  id="timezone"
                  placeholder="Enter timezone offset..."
                  value={inputsData.timezone}
                  onChange={(e) =>
                    setInputsData((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        timezone: e.target.value,
                      };
                    })
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm text-[#09090b] leading-[20px] font-medium">
                  Status
                </span>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="active"
                    defaultChecked={inputsData.status === "Active"}
                    checked={inputsData.status === "Active"}
                    onCheckedChange={() => handleCheck("Active")}
                    className="flex items-center justify-center w-4 h-4 rounded-full border border-[#e4e4e7] cursor-pointer data-[state=checked]:border-[#0283fa] data-[state=checked]:bg-[#fff]"
                    iconClassName="hidden"
                    indicatorClassName="w-3 h-3 rounded-full bg-[#0283fa]"
                  />
                  <Label htmlFor="active">Active</Label>
                  <Checkbox
                    id="inactive"
                    defaultChecked={inputsData.status === "Inactive"}
                    checked={inputsData.status === "Inactive"}
                    onCheckedChange={() => handleCheck("Inactive")}
                    className="flex items-center justify-center w-4 h-4 rounded-full border border-[#e4e4e7] cursor-pointer data-[state=checked]:border-[#0283fa] data-[state=checked]:bg-[#fff]"
                    iconClassName="hidden"
                    indicatorClassName="w-3 h-3 rounded-full bg-[#0283fa]"
                  />
                  <Label htmlFor="inactive">Inactive</Label>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex items-center gap-4 self-end">
          <Button
            variant="outline"
            onClick={() => {
              props.setModalInfo({
                isOpen: false,
                item: null,
              });
            }}
          >
            Cancel
          </Button>
          <Button type="submit" className="w-[137px] bg-[#0283fa]">
            {props.item == null ? "Add" : "Edit"} client
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
